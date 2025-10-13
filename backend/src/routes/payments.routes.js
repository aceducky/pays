import express from "express";
import mongoose from "mongoose";
import z from "zod/v4";
import { Payments } from "../db/models/payments.models.js";
import { Users } from "../db/models/users.models.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { criticalOperationMiddleware } from "../middleware/criticalOperation.middleware.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.middleware.js";
import reqBodyValidatorMiddleware from "../middleware/reqBodyValidator.middleware.js";
import {
  paymentListingLimiter,
  paymentReceiptLimiter,
  paymentWriteLimiter,
} from "../rateLimiters.js";
import { accountSettings } from "../../../shared/settings/accountSettings.js";
import { paymentDollarsStrToCents } from "../utils/amountHelpers.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError, ServerError } from "../utils/Errors.js";
import { getFormattedPayment } from "../utils/formatters.js";
import logger from "../utils/logger.js";
import { getPaginationValues, getQueryParam } from "../utils/reqQueryHelper.js";
import {
  paymentAmountStrSchema,
  paymentDescriptionSchema,
} from "../../../shared/zodSchemas/payment.zodSchema.js";
import { paymentSortSchema } from "../zodSchemas/payment.zodSchema.js";
import { paymentTypeSchema } from "../zodSchemas/payment.zodSchema.js";
import { paymentIdSchema } from "../zodSchemas/payment.zodSchema.js";
import { userNameSchema } from "../../../shared/zodSchemas/user.zodSchema.js";

const router = express.Router();

router.get(
  "/",
  rateLimitMiddleware(paymentListingLimiter),
  authMiddleware,
  async (req, res) => {
    const userIdObjId = new mongoose.Types.ObjectId(req.userId);
    const user = await Users.findById(userIdObjId);
    if (!user) {
      throw new ApiError({
        statusCode: 400,
        message: "User not found",
      });
    }

    const type = getQueryParam(req, "type", paymentTypeSchema, "");
    const { page, limit, skip } = getPaginationValues(req, 1, 10);
    const sort = getQueryParam(req, "sort", paymentSortSchema, "desc");
    const pipeline = [];
    let typeFilter = {};

    if (type === "") {
      typeFilter = {
        $or: [{ senderId: userIdObjId }, { receiverId: userIdObjId }],
      };
    } else if (type === "sent") {
      typeFilter = { senderId: userIdObjId };
    } else if (type === "received") {
      typeFilter = { receiverId: userIdObjId };
    }

    pipeline.push({ $match: typeFilter });

    const sortFilter = sort === "asc" ? 1 : -1;
    pipeline.push({
      $facet: {
        data: [
          {
            $project: {
              _id: 0,
              paymentId: "$_id",
              senderUserName: 1,
              senderFullNameSnapshot: 1,
              receiverUserName: 1,
              receiverFullNameSnapshot: 1,
              amount: 1,
              status: 1,
              description: 1,
              timestamp: "$createdAt",
            },
          },
          {
            $sort: {
              timestamp: sortFilter,
            },
          },
          { $skip: skip },
          { $limit: limit },
        ],
        count: [{ $count: "total" }],
      },
    });

    const [result] = await Payments.aggregate(pipeline);
    const payments = result.data;
    const total = result.count[0]?.total ?? 0;

    return new ApiResponse({
      res,
      statusCode: 200,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

router.post(
  "/",
  rateLimitMiddleware(paymentWriteLimiter),
  authMiddleware,
  criticalOperationMiddleware,
  reqBodyValidatorMiddleware(
    z.object({
      receiverUserName: userNameSchema,
      amountStr: paymentAmountStrSchema,
      description: paymentDescriptionSchema,
    })
  ),
  async (req, res) => {
    const senderId = req.userId;
    const senderUserName = req.userName;
    const { receiverUserName, amountStr, description } = req.body;

    if (senderUserName === receiverUserName) {
      throw new ApiError({
        statusCode: 400,
        message: "Cannot send payment to yourself",
      });
    }

    let session;

    try {
      session = await mongoose.startSession();
      const result = await session.withTransaction(async () => {
        const [sender, receiver] = await Promise.all([
          Users.findById(senderId).select("fullName").session(session),
          Users.findOne({ userName: receiverUserName })
            .select("_id userName fullName")
            .session(session),
        ]);

        if (!sender) {
          throw new ApiError({
            statusCode: 400,
            message: "Sender does not exist",
          });
        }

        if (!receiver) {
          throw new ApiError({
            statusCode: 400,
            message: "Receiver does not exist",
          });
        }

        const amountInCents = paymentDollarsStrToCents(amountStr);

        const receiverId = receiver._id;

        // Update sender balance
        const updatedSender = await Users.findOneAndUpdate(
          {
            _id: senderId,
            // check if sender has enough balance, returns null otherwise
            balance: { $gte: amountInCents },
          },
          {
            $inc: { balance: -amountInCents },
          },
          { session, new: true, runValidators: true }
        );
        // if sender did not have enough balance
        if (!updatedSender) {
          throw new ApiError({
            statusCode: 400,
            message: "Insufficient balance",
          });
        }
        // Update receiver balance
        const updatedReceiver = await Users.findOneAndUpdate(
          {
            _id: receiverId,
            balance: { $lte: accountSettings.MAX_BALANCE - amountInCents }, // Ensure it won't exceed max balance
          },
          { $inc: { balance: amountInCents } },
          { session, new: true, runValidators: true }
        );

        if (!updatedReceiver) {
          throw new ApiError({
            statusCode: 400,
            message:
              "Transaction failed: This transfer cannot be completed because the receiver's account cannot accept this amount.",
          });
        }

        const payment = new Payments({
          senderId,
          receiverId,
          senderUserName,
          receiverUserName: receiver.userName,
          senderFullNameSnapshot: sender.fullName,
          receiverFullNameSnapshot: receiver.fullName,
          amount: amountStr,
          description,
        });

        await payment.save({ session });
        return payment;
      });

      const formattedPayment = getFormattedPayment(result);
      return new ApiResponse({
        res,
        statusCode: 201,
        data: formattedPayment,
        message: "Payment successful",
      });
    } catch (err) {
      // if error is from upstream, throw it here
      if (err instanceof ApiError || err instanceof ServerError) {
        throw err;
      }

      if (!(err instanceof ServerError)) {
        logger.error(
          "Payment failure",
          "Reason: ",
          err?.message,
          "error: ",
          err
        );
      }

      // throw other errors here:
      throw new ServerError({
        message: "Payment failed",
      });
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
);

router.get(
  "/:id",
  rateLimitMiddleware(paymentReceiptLimiter),
  authMiddleware,
  criticalOperationMiddleware,
  async (req, res) => {
    const incomingId = req.params.id;
    const parsedResult = paymentIdSchema.safeParse(incomingId);
    if (!parsedResult.success) {
      throw new ApiError({
        statusCode: 400,
        message: "Invalid Payment ID",
      });
    }

    const parsedId = parsedResult.data;
    const payment = await Payments.findById(parsedId);

    if (
      !payment ||
      //check if user is related to the payment or not
      (req.userName !== payment.senderUserName &&
        req.userName !== payment.receiverUserName)
    ) {
      throw new ApiError({
        statusCode: 404,
        message: "No payment found for the provided ID.",
      });
    }

    return new ApiResponse({
      res,
      statusCode: 200,
      data: getFormattedPayment(payment),
    });
  }
);

export { router as paymentRouter };
