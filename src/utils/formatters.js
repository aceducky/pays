export const getFormattedPayment = (payment) => {
  return {
    _id: payment._id,
    senderUserName: payment.senderUserName,
    senderFullNameSnapshot: payment.senderFullNameSnapshot,
    receiverUserName: payment.receiverUserName,
    receiverFullNameSnapshot: payment.receiverFullNameSnapshot,
    amount: payment.amount,
    timestamp: payment.createdAt,
    description: payment.description,
  };
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const dollarFormatter = (dollars) => {
  return currencyFormatter.format(dollars);
};
