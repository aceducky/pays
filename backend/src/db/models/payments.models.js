import mongoose from "mongoose";
import { fullNameField } from "./commonFields.js";
import { paymentSettings } from "../../settings/paymentSettings.js";
import {
  isValidAmountFormat,
  to2DecimalPlaces,
} from "../../utils/numberHelpers.js";

const paymentSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    senderFullNameSnapshot: fullNameField("Full name of Sender", {
      immutable: true,
    }),
    receiverFullNameSnapshot: fullNameField("Full name of Receiver", {
      immutable: true,
    }),
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      validate: {
        validator: function (value) {
          return isValidAmountFormat(value);
        },
        message:
          "Amount must be a positive number with at most 2 decimal places",
      },

      min: [
        paymentSettings.minAllowedAmount,
        `Amount must be at least ${paymentSettings.minAllowedAmount}`,
      ],
      max: [
        paymentSettings.maxAllowedAmount,
        `Amount cannot be greater than ${paymentSettings.maxAllowedAmount}`,
      ],
      set: (value) => to2DecimalPlaces(value),
      immutable: true,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    description: { type: String, maxLength: 255, immutable: true },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ senderId: 1, receiverId: 1 });
paymentSchema.index({ receiverId: 1 });
const Payment = mongoose.model("Payment", paymentSchema);

export { Payment };
