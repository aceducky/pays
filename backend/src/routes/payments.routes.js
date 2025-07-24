import express from "express";
import authenticateAccessTokenMiddleware from "../middleware/authenticateAccessToken.middleware.js";
import { getPaginationValues, getQueryParam } from "../utils/reqQueryHelper.js";
import {
  paymentAmountSchema,
  paymentDescriptionSchema,
  paymentSortSchema,
  paymentStatusSchema,
  paymentTypeSchema,
  userNameSchema,
} from "../zodSchemas.js";
import { Users } from "../db/models/users.models.js";
import { ApiError, ServerError } from "../utils/Errors.js";
import { Payments } from "../db/models/payments.models.js";
import reqBodyValidatorMiddleware from "../middleware/reqBodyValidator.middleware.js";
import { z } from "zod/v4";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { getFormattedPayment } from "../utils/responseHelpers.js";

const router = express.Router();

router.get("/", authenticateAccessTokenMiddleware, async (req, res) => {
  const userIdObjId = new mongoose.Types.ObjectId(req.userId);
  const user = await Users.findById(userIdObjId);
  if (!user) {
    throw new ApiError({
      statusCode: 400,
      message: "User not found",
    });
  }

  const type = getQueryParam(req, "type", paymentTypeSchema, "");
  const status = getQueryParam(req, "status", paymentStatusSchema, "");

  // Validate that users can't query non-success received payments
  if (
    (type === "received" || type === "") &&
    status !== "" &&
    status !== "success"
  ) {
    throw new ApiError({
      statusCode: 400,
      message: "Only successfully received payments are viewable",
    });
  }

  const { page, limit, skip } = getPaginationValues(req, 1, 10);
  const sort = getQueryParam(req, "sort", paymentSortSchema, "desc");
  const pipeline = [];
  let typeFilter = {};

  if (type === "") {
    typeFilter = {
      $or: [
        { senderId: userIdObjId },
        { receiverId: userIdObjId, status: "success" },
      ],
    };
  } else if (type === "sent") {
    typeFilter = { senderId: userIdObjId };
  } else if (type === "received") {
    typeFilter = { receiverId: userIdObjId, status: "success" };
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
          $project: {
            _id: 1,
            senderUserName: 1,
            receiverUserName: 1,
            senderFullNameSnapshot: 1,
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
        receiverUserName: userNameSchema,
        amount: paymentAmountSchema,
        description: paymentDescriptionSchema,
      })
      .strip()
  ),
  async (req, res) => {
    const senderId = req.userId;
    const senderUserName = req.userName;
    const { receiverUserName, amount, description } = req.body;

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
          Users.findById(senderId).select("fullName balance").session(session),
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

        if (sender.balance < amount) {
          throw new ApiError({
            statusCode: 400,
            message: "Insufficient balance",
          });
        }

        const receiverId = receiver._id;

        // Update sender balance
        await Users.findOneAndUpdate(
          { _id: senderId },
          { $inc: { balance: -amount } },
          { session, runValidators: true }
        );

        // Update receiver balance
        await Users.findOneAndUpdate(
          { _id: receiverId },
          { $inc: { balance: amount } },
          { session, runValidators: true }
        );

        const payment = new Payments({
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

      const formattedPayment = getFormattedPayment(result);
      return new ApiResponse(res, 200, formattedPayment, "Payment successful");
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }

      try {
        const [senderInfo, receiverInfo] = await Promise.all([
          Users.findById(senderId).select("fullName email").lean(),
          Users.findOne({ userName: receiverUserName })
            .select("_id userName fullName email")
            .lean(),
        ]);

        const failedPayment = new Payments({
          senderId,
          receiverId: receiverInfo._id,
          senderUserName,
          receiverUserName: receiverInfo.userName,
          senderFullNameSnapshot: senderInfo.fullName,
          receiverFullNameSnapshot: receiverInfo.fullName,
          amount,
          status: "failed",
          description,
        });

        const savedFailedPayment = await failedPayment.save();
        const formattedPayment = getFormattedPayment(savedFailedPayment);
        logger.error("transaction", "Payment failed due to system error:", err);

        throw new ServerError({
          message: "Payment failed due to system error",
          data: formattedPayment,
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
