import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/cathcAsync";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";

const createPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;
    const result = await paymentService.createPaymentDB(req.body, tenantId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment session created successfully",
      data: result,
    });
    next();
  },
);

const confirmPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await paymentService.confirmPaymentDB(req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment confirmed successfully",
      data: result,
    });
    next();
  },
);

const sslcommerzIpn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tran_id, val_id } = req.body;
    if (tran_id && val_id) {
      await paymentService.confirmPaymentDB({
        transactionId: tran_id,
        valId: val_id,
      });
    }
    res.status(httpStatus.OK).json({ success: true });
  },
);

const getMyPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;
    const result = await paymentService.getMyPaymentsDB(tenantId, req.query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment history fetched successfully",
      data: result.data,
      meta: result.meta,
    });
    next();
  },
);

const getPaymentById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id as string;
    const role = req.user?.role as string;
    const result = await paymentService.getPaymentByIdDB(
      id as string,
      userId,
      role,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment details fetched successfully",
      data: result,
    });
    next();
  },
);

export const paymentController = {
  createPayment,
  confirmPayment,
  sslcommerzIpn,
  getMyPayments,
  getPaymentById,
};
