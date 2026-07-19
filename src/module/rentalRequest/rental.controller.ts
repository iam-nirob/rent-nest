import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/cathcAsync";
import { rentalService } from "./rental.service";
import { sendResponse } from "../../utils/sendResponse";

const submitRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    if (!id) {
      throw new Error("User ID not found");
    }
    const payload = req.body;
    const result = await rentalService.submitRentalRequestDB(payload, id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Rental request submitted successfully",
      data: result,
    });
    next();
  },
);

const getRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

const getAllRentalRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

const updateRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const rentalController = {
  submitRentalRequest,
  getRentalRequest,
  getAllRentalRequests,
  updateRentalRequest,
};
