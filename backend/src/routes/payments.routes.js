import express from "express";
import authenticateAccessTokenMiddleware from "../middleware/authenticateAccessToken.middleware.js";
import { getPaginationValues, getQueryParam } from "../utils/reqQueryHelper.js";
import {
  paymentAmountSchema,
  paymentDescriptionSchema,
  paymentSortSchema,
  paymentStatusSchema,
  paymentTypeSchema,
  userIdSchema,
} from "../zodSchemas.js";
import { User } from "../db/models/user.model.js";
import { ApiError, ServerError } from "../utils/Errors.js";
import { Payment } from "../db/models/payments.models.js";
import reqBodyValidatorMiddleware from "../middleware/reqBodyValidator.middleware.js";
import { z } from "zod/v4";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import logger from "../utils/logger.js";

const router = express.Router();

router.get("/", authenticateAccessTokenMiddleware, async (req, res) => {
  const userIdObjId = new mongoose.Types.ObjectId(req.userId);
  const user = await User.findById(userIdObjId);
  if (!user) {
    throw new ApiError({
      statusCode: 400,
      message: "User not found",
    });
  }

  const type = getQueryParam(req, "type", paymentTypeSchema, "");
  const status = getQueryParam(req, "status", paymentStatusSchema, "");
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

  if (status !== "") {
    pipeline.push({
      $match: { status: status },
    });
  }

  let sortFilter = sort === "asc" ? 1 : -1;

  pipeline.push({
    $facet: {
      data: [
        {
          $sort: {
            createdAt: sortFilter,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ],
      count: [{ $count: "total" }],
    },
  });

  const data = await Payment.aggregate(pipeline);
  console.log(JSON.stringify(data, null, 2));
  const [result] = data;
  const payments = result.data;
  const total = result.count[0]?.total ?? 0;

  return new ApiResponse(res, 200, {
    payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

router.post(
  "/",
  authenticateAccessTokenMiddleware,
  reqBodyValidatorMiddleware(
    z
      .object({
        receiverId: userIdSchema,
        amount: paymentAmountSchema,
        description: paymentDescriptionSchema,
      })
      .strip()
  ),
  async (req, res) => {
    const senderId = req.userId;
    const senderUserName = req.userName;
    const { receiverId, amount, description } = req.body;

    if (senderId === receiverId) {
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
          User.findById(senderId).select("fullName balance").session(session),
          User.findById(receiverId)
            .select("username fullName")
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

        if (sender.balance < amount) {
          throw new ApiError({
            statusCode: 400,
            message: "Insufficient balance",
          });
        }

        // Update sender balance
        await User.findOneAndUpdate(
          { _id: senderId },
          { $inc: { balance: -amount } },
          { session, runValidators: true }
        );

        // Update receiver balance
        await User.findOneAndUpdate(
          { _id: receiverId },
          { $inc: { balance: amount } },
          { session, runValidators: true }
        );

        const payment = new Payment({
          senderId,
          receiverId,
          senderUserName,
          receiverUserName: receiver.userName,
          senderFullNameSnapshot: sender.fullName,
          receiverFullNameSnapshot: receiver.fullName,
          amount,
          status: "success",
          description,
        });

        await payment.save({ session });
        return payment;
      });
      return new ApiResponse(res, 200, result, "Payment successful");
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }

      try {
        const [senderInfo, receiverInfo] = await Promise.all([
          User.findById(senderId).select("fullName email").lean(),
          User.findById(receiverId).select("userName fullName email").lean(),
        ]);

        const failedPayment = new Payment({
          senderId,
          receiverId,
          senderUserName,
          receiverUserName: receiverInfo.userName,
          senderFullNameSnapshot: senderInfo.fullName,
          receiverFullNameSnapshot: receiverInfo.fullName,
          amount,
          status: "failed",
          description,
        });

        const savedFailedPayment = await failedPayment.save();
        logger.error("transaction", "Payment failed due to system error:", err);

        throw new ServerError({
          message: "Payment failed due to system error",
          data: savedFailedPayment,
        });
      } catch (err) {
        if (err instanceof ServerError) {
          throw err;
        }

        logger.error(
          "transaction",
          "Failed to save failed payment record:",
          err
        );
        throw new ServerError({
          message: "Error while saving failed payment record",
        });
      }
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
);

export { router as paymentRouter };
