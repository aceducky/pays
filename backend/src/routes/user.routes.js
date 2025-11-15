import { Router } from "express";
import mongoose from "mongoose";
import { userFullNameChangeSchema } from "../../../shared/zodSchemas/user.zodSchema.js";
import { Users } from "../db/models/users.models.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.middleware.js";
import reqBodyValidatorMiddleware from "../middleware/reqBodyValidator.middleware.js";
import {
  balanceCheckLimiter,
  fullNameChangeLimiter,
  selfProfileLimiter,
  userListingLimiter,
} from "../rateLimiters.js";
import { centsToDollars } from "../utils/amountHelpers.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError, ServerError } from "../utils/Errors.js";
import logger from "../utils/logger.js";
import { getPaginationValues } from "../utils/reqQueryHelper.js";
import { queryUsersSchema } from "../../../shared/zodSchemas/user.zodSchema.js";
import { dollarFormatter } from "../../../shared/formatters/dollarFormatter.js";

const router = Router();

router.get(
  "/me",
  rateLimitMiddleware(selfProfileLimiter),
  authMiddleware,
  async (req, res) => {
    const fetchedUser = await Users.findById(req.userId)
      .select("fullName balance")
      .lean();
    if (!fetchedUser) {
      throw new ApiError({
        statusCode: 400,
        message: "User not found",
      });
    }
    return new ApiResponse({
      res,
      statusCode: 200,
      data: {
        user: {
          userName: req.userName,
          fullName: fetchedUser.fullName,
          balance: dollarFormatter(fetchedUser.balance),
        },
      },
    });
  }
);

router.get(
  "/bulk",
  rateLimitMiddleware(userListingLimiter),
  authMiddleware,
  async (req, res) => {
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
      const regex = new RegExp("^" + filterQuery, "i");

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
  }
);

router.get(
  "/balance",
  rateLimitMiddleware(balanceCheckLimiter),
  authMiddleware,
  async (req, res) => {
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
  }
);

router.patch(
  "/fullName",
  rateLimitMiddleware(fullNameChangeLimiter),
  authMiddleware,
  reqBodyValidatorMiddleware(userFullNameChangeSchema),
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

export { router as userRouter };
