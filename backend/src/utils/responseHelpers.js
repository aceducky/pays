export const getFormattedPayment = (payment) => {
  return {
    _id: payment._id,
    senderUserName: payment.senderUserName,
    receiverUserName: payment.receiverUserName,
    senderFullNameSnapshot: payment.senderFullNameSnapshot,
    receiverFullNameSnapshot: payment.receiverFullNameSnapshot,
    amount: payment.amount.toString(),
    timestamp: payment.createdAt,
    status: payment.status,
    description: payment.description,
  };
};
