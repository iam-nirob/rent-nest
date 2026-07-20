export interface ICreatePaymentPayload {
  rentalRequestId: string;
  provider: "STRIPE" | "SSLCOM";
}

export interface IConfirmPaymentPayload {
  transactionId: string;
  sessionId?: string;
  valId?: string;
}

export interface IPaymentQuery {
  status?: string;
  page?: string;
  limit?: string;
}
