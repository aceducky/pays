export const getFormattedPayment = (payment) => {
  return {
    paymentId: payment._id,
    senderUserName: payment.senderUserName,
    senderFullNameSnapshot: payment.senderFullNameSnapshot,
    receiverUserName: payment.receiverUserName,
    receiverFullNameSnapshot: payment.receiverFullNameSnapshot,
    amount: payment.amount,
    timestamp: payment.createdAt,
    description: payment.description,
  };
};