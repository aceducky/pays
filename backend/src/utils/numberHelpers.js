export const to2DecimalPlaces = (amount) => {
  return Math.round(amount * 100) / 100;
};

export const isValidAmountFormat = (amount) => {
  if (typeof amount !== "number" || !isFinite(amount) || amount < 0) {
    return false;
  }

  return Number.isInteger(amount * 100);
};
