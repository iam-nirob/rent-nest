import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { sslcommerz } from "../../lib/sslcommerz";
import config from "../../config";
import { createHttpError } from "../../utils/appError";
import {
  IConfirmPaymentPayload,
  ICreatePaymentPayload,
  IPaymentQuery,
} from "./payment.interface";

// Tenant: create a payment session (Stripe checkout or SSLCommerz gateway)
// for an APPROVED rental request
const createPaymentDB = async (
  payload: ICreatePaymentPayload,
  tenantId: string,
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: payload.rentalRequestId },
    include: { property: true, payment: true },
  });

  if (!rentalRequest) {
    throw createHttpError("Rental request not found", 404);
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw createHttpError("This is not your rental request", 403);
  }

  if (rentalRequest.status !== "APPROVED") {
    throw createHttpError(
      "You can only pay for an APPROVED rental request",
      400,
    );
  }

  if (rentalRequest.payment) {
    throw createHttpError(
      "A payment has already been initiated for this rental request",
      400,
    );
  }

  const tenant = await prisma.users.findUniqueOrThrow({
    where: { id: tenantId },
  });

  const amount = Number(rentalRequest.property.price);
  const transactionId = `RN-${Date.now()}-${crypto.randomUUID()}`;

  const payment = await prisma.payment.create({
    data: {
      transactionId,
      amount,
      provider: payload.provider,
      status: "PENDING",
      rentalRequestId: rentalRequest.id,
      tenantId,
    },
  });

  if (payload.provider === "STRIPE") {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: rentalRequest.property.title },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      client_reference_id: transactionId,
      metadata: { paymentId: payment.id, transactionId },
      success_url: `${config.app_url}/payments/success?transactionId=${transactionId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.app_url}/payments/cancel?transactionId=${transactionId}`,
    });

    return { paymentUrl: session.url, transactionId, paymentId: payment.id };
  }

  // SSLCOM
  const session = await sslcommerz.initiateSession({
    total_amount: amount,
    tran_id: transactionId,
    success_url: `${config.app_url}/payments/success?transactionId=${transactionId}`,
    fail_url: `${config.app_url}/payments/fail?transactionId=${transactionId}`,
    cancel_url: `${config.app_url}/payments/cancel?transactionId=${transactionId}`,
    ipn_url: `${config.base_url}/api/payments/ipn/sslcommerz`,
    cus_name: tenant.name,
    cus_email: tenant.email,
    cus_phone: tenant.phone || undefined,
    product_name: rentalRequest.property.title,
  });

  if (session.status !== "SUCCESS" || !session.GatewayPageURL) {
    throw createHttpError(
      session.failedreason || "Failed to initiate SSLCommerz session",
      502,
    );
  }

  return {
    paymentUrl: session.GatewayPageURL,
    transactionId,
    paymentId: payment.id,
  };
};

// Marks a payment COMPLETED and activates the rental (tenant moves in)
const markPaymentCompleted = async (
  paymentId: string,
  method: string | null,
) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "COMPLETED",
        method: method || undefined,
        paidAt: new Date(),
      },
    });

    const rentalRequest = await tx.rentalRequest.update({
      where: { id: payment.rentalRequestId },
      data: { status: "ACTIVE" },
    });

    await tx.property.update({
      where: { id: rentalRequest.propertyId },
      data: { status: "RENTED" },
    });

    return payment;
  });
};

// POST /api/payments/confirm - confirm/verify a payment (called by the
// frontend after redirect back from Stripe/SSLCommerz, or by a webhook/IPN)
const confirmPaymentDB = async (payload: IConfirmPaymentPayload) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: payload.transactionId },
  });

  if (!payment) {
    throw createHttpError("Payment not found", 404);
  }

  if (payment.status === "COMPLETED") {
    return payment;
  }

  if (payment.provider === "STRIPE") {
    if (!payload.sessionId) {
      throw createHttpError(
        "sessionId is required to confirm a Stripe payment",
        400,
      );
    }
    const session = await stripe.checkout.sessions.retrieve(payload.sessionId);

    if (session.payment_status !== "paid") {
      throw createHttpError("Payment has not been completed yet", 400);
    }

    return markPaymentCompleted(payment.id, "card");
  }

  // SSLCOM
  if (!payload.valId) {
    throw createHttpError(
      "valId is required to confirm an SSLCommerz payment",
      400,
    );
  }
  const validation = await sslcommerz.validateTransaction(payload.valId);

  if (validation.status !== "VALID" && validation.status !== "VALIDATED") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    throw createHttpError("SSLCommerz payment validation failed", 400);
  }

  return markPaymentCompleted(
    payment.id,
    validation.card_type || "mobile_banking",
  );
};

// Tenant: view own payment history
const getMyPaymentsDB = async (tenantId: string, query: IPaymentQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const where = {
    tenantId,
    ...(query.status ? { status: query.status as any } : {}),
  };

  const payments = await prisma.payment.findMany({
    where,
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: { rentalRequest: { include: { property: true } } },
  });

  const total = await prisma.payment.count({ where });

  return {
    data: payments,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

// Tenant/Landlord/Admin: view a single payment's details
const getPaymentByIdDB = async (id: string, userId: string, role: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      rentalRequest: { include: { property: true } },
      tenant: { omit: { password: true } },
    },
  });

  if (!payment) {
    throw createHttpError("Payment not found", 404);
  }

  const isOwnerTenant = payment.tenantId === userId;
  const isOwnerLandlord = payment.rentalRequest.property.landLordId === userId;
  const isAdmin = role === "ADMIN";

  if (!isOwnerTenant && !isOwnerLandlord && !isAdmin) {
    throw createHttpError(
      "You don't have permission to view this payment",
      403,
    );
  }

  return payment;
};

export const paymentService = {
  createPaymentDB,
  confirmPaymentDB,
  getMyPaymentsDB,
  getPaymentByIdDB,
};
