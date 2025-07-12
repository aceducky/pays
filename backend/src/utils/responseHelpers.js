export const getFormattedPayment = (payment) => {
  return {
    _id: payment._id,
    senderId: payment.senderId,
    receiverId: payment.receiverId,
    senderFullNameSnapshot: payment.senderFullNameSnapshot,
    receiverFullNameSnapshot: payment.receiverFullNameSnapshot,
    senderEmail: payment.senderEmail,
    receiverEmail: payment.receiverEmail,
    amount: payment.amount.toString(),
    timestamp: payment.createdAt,
    status: payment.status,
    description: payment.description,
  };
};
