import { Router } from "express";
import reqBodyValidatorMiddleware from "../middleware/reqBodyValidator.middleware.js";
import z from "zod/v4";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError, ServerError } from "../utils/Errors.js";
import logger from "../utils/logger.js";
import authMiddleware from "../middleware/auth.Middleware.js";
import { Users } from "../db/models/users.models.js";
import {
  fullNameSchema,
  queryUsersSchema,
  userNameSchema,
} from "../zodSchemas.js";
import { getPaginationValues } from "../utils/reqQueryHelper.js";
import mongoose from "mongoose";
import { centsToDollars } from "../utils/amountHelpers.js";

const router = Router();

router.get("/bulk", authMiddleware, async (req, res) => {
  const filterQuery = req.query?.filter?.trim() ?? "";
  const parseResult = queryUsersSchema.safeParse(filterQuery);
  if (!parseResult.success) {
    throw new ApiError({
      statusCode: 400,
      message: "Invalid username",
    });
  }

  const { page, limit, skip } = getPaginationValues(req);
  const currentUserId = new mongoose.Types.ObjectId(req.userId);

  let users, total;

  if (filterQuery) {
    // Use regex search on userName field when filter is provided
    const regex = new RegExp(filterQuery, "i");

    [users, total] = await Promise.all([
      Users.find(
        {
          userName: { $regex: regex },
          _id: { $ne: currentUserId },
        },
        { _id: 0, userName: 1, fullName: 1 }
      )
        .skip(skip)
        .limit(limit)
        .lean(),
      Users.countDocuments({
        userName: { $regex: regex },
        _id: { $ne: currentUserId },
      }),
    ]);
  } else {
    // Return all users except current one when there's no filter
    const filter = { _id: { $ne: currentUserId } };
    const projection = { _id: 0, userName: 1, fullName: 1 };

    [users, total] = await Promise.all([
      Users.find(filter, projection).lean().skip(skip).limit(limit),
      Users.countDocuments(filter),
    ]);
  }

  return new ApiResponse({
    res,
    statusCode: 200,
    data: {
      users,
      pagination: {
        page,
        limit,
        skip,
        pages: Math.ceil(total / limit),
      },
    },
    message: "User(s) retrieved successfully",
  });
});

router.get("/balance", authMiddleware, async (req, res) => {
  const { balance } = await Users.findById(req.userId, {
    _id: 0,
    balance: 1,
  }).lean();

  return new ApiResponse({
    res,
    statusCode: 200,
    data: centsToDollars(balance),
    message: "Balance retrieved successfully",
  });
});

router.patch(
  "/fullName",
  authMiddleware,
  reqBodyValidatorMiddleware(
    z.object({
      fullName: fullNameSchema,
    })
  ),
  async (req, res) => {
    const { fullName: newFullName } = req.body;
    const user = await Users.findById(req.userId)
      .select("-_id fullName")
      .lean();
    if (!user) {
      logger.error(
        "change-fullName",
        "User credentials and request is valid but user not found, maybe the db is unreachable"
      );
      throw new ServerError({
        message: "Error while processing the full name",
      });
    }
    if (newFullName === user.fullName) {
      return new ApiResponse({
        res,
        statusCode: 200,
        data: null,
        message: "Nothing to update",
      });
    }
    const updatedUser = await Users.findByIdAndUpdate(
      req.userId,
      { fullName: newFullName },
      { new: true, runValidators: true }
    )
      .select("-_id fullName")
      .lean();
    if (!updatedUser) {
      throw new ServerError({ message: "Error while updating full name" });
    }
    return new ApiResponse({
      res,
      statusCode: 200,
      data: { fullName: updatedUser.fullName },
      message: "Updated full name successfully",
    });
  }
);

router.post(
  "/get-curr-fullName",
  authMiddleware,
  reqBodyValidatorMiddleware(
    z.object({
      userName: userNameSchema,
    })
  ),
  async (req, res) => {
    const { userName } = req.body;
    const user = await Users.findOne({ userName })
      .select("-_id fullName")
      .lean();
    return new ApiResponse({
      res,
      statusCode: 200,
      data: { currFullName: user.fullName },
      message: "Full name retrieved successfully",
    });
  }
);

export { router as userRouter };
