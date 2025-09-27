import { ApiError, ServerError } from "./Errors.js";
import { paymentAmountStrSchema } from "../zodSchemas.js";

export const isValidCentsFormat = (cents) => {
  return Number.isSafeInteger(cents) && cents >= 0;
};
export const dollarFormatter = (dollars) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(dollars);
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
  if (!parseResult.success) {
    throw new ApiError({
      statusCode: 400,
      message: "Invalid amount format",
    });
  }

  return Number(parseResult.data) * 100;
};
