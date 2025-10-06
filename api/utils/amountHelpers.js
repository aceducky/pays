import { paymentAmountStrSchema } from "../zodSchemas/payment.zodSchema.js";
import { ApiError, ServerError } from "./Errors.js";
import { dollarFormatter } from "./formatters.js";

export const isValidCentsFormat = (cents) => {
  return Number.isSafeInteger(cents) && cents >= 0;
};

export const centsToDollars = (cents) => {
  if (!isValidCentsFormat(cents))
    throw new ServerError({
      message: "Invalid amount format",
    });

  const dollarStr = (cents / 100).toFixed(2);
  return dollarFormatter(dollarStr);
};

export const paymentDollarsStrToCents = (dollarsStr) => {
  const parseResult = paymentAmountStrSchema.safeParse(dollarsStr);
  if (!parseResult.success)
    throw new ApiError({
      statusCode: 400,
      message: "Invalid amount format",
    });

  const numberValue = Number(parseResult.data);
  if (isNaN(numberValue))
    throw new ApiError({
      statusCode: 400,
      message: "Invalid amount format",
    });
  return numberValue * 100;
};
