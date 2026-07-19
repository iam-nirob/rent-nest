export interface ICreatePaymentPayload {
  rentalRequestId: string;
  provider: "STRIPE" | "SSLCOM";
}

export interface IConfirmPaymentPayload {
  transactionId: string;
  // Required when confirming a STRIPE payment - the Checkout Session id
  // returned to the frontend as `?session_id=...` on the success redirect.
  sessionId?: string;
  // Required when confirming an SSLCOM payment - the val_id SSLCommerz
  // appends to the success redirect / sends to the IPN listener.
  valId?: string;
}

export interface IPaymentQuery {
  status?: string;
  page?: string;
  limit?: string;
}
