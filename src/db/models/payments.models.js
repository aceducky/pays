import mongoose from "mongoose";
import { paymentSettings } from "../../settings/paymentSettings.js";
import { dollarFormatter } from "../../utils/formatters.js";
import { paymentAmountStrSchema } from "../../zodSchemas/payment.zodSchema.js";
import { fullNameField, userNameField } from "./commonFields.js";

const paymentSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      immutable: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      immutable: true,
    },
    // ---EMBEDDED FIELDS---
    senderUserName: userNameField(),
    senderFullNameSnapshot: fullNameField({
      immutable: true,
    }),
    receiverUserName: userNameField(),
    receiverFullNameSnapshot: fullNameField({
      immutable: true,
    }),
    //---
    amount: {
      type: String,
      required: [true, "Amount is required"],
      set: function (value) {
        return dollarFormatter(value);
      },
      validate: {
        validator: function (value) {
          const cleanValue = value.replace(/[$,]/g, "");
          return paymentAmountStrSchema.safeParse(cleanValue).success;
        },
        message: `Amount must be a valid currency amount between ${dollarFormatter(paymentSettings.MIN_ALLOWED_AMOUNT)} and ${dollarFormatter(paymentSettings.MAX_ALLOWED_AMOUNT)}`,
      },
      immutable: true,
    },

    description: {
      type: String,
      maxLength: [255, "Description cannot be more than 255 characters"],
      immutable: true,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

const Payments = mongoose.model("Payments", paymentSchema);

export { Payments };
