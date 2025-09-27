import mongoose from "mongoose";
import { fullNameField, userNameField } from "./commonFields.js";
import { paymentSettings } from "../../settings/paymentSettings.js";
import { paymentAmountStrSchema } from "../../zodSchemas.js";
import { dollarFormatter } from "../../utils/amountHelpers.js";

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
        message: `Amount must be a valid currency amount between ${dollarFormatter(paymentSettings.minAllowedAmount)} and ${dollarFormatter(paymentSettings.maxAllowedAmount)}`,
      },
      immutable: true,
    },

    description: { type: String, maxLength: 255, immutable: true },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

const Payments = mongoose.model("Payments", paymentSchema);

export { Payments };
