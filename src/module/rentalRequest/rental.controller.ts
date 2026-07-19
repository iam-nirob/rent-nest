import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/cathcAsync";
import { rentalService } from "./rental.service";
import { sendResponse } from "../../utils/sendResponse";

const submitRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id as string;
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

// GET /api/rentals  (tenant's own rental request history)
const getRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;
    const result = await rentalService.getMyRentalRequestsDB(
      tenantId,
      req.query,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests fetched successfully",
      data: result.data,
      meta: result.meta,
    });
    next();
  },
);

// GET /api/rentals/:id
const getRentalRequestById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id as string;
    const role = req.user?.role as string;
    const result = await rentalService.getRentalRequestByIdDB(
      id as string,
      userId,
      role,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental request fetched successfully",
      data: result,
    });
    next();
  },
);

// GET /api/landlord/requests  (landlord's incoming requests)
const getAllRentalRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id as string;
    const result = await rentalService.getLandlordRentalRequestsDB(
      landlordId,
      req.query,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rental requests for your properties fetched successfully",
      data: result.data,
      meta: result.meta,
    });
    next();
  },
);

// PATCH /api/landlord/requests/:id  (approve / reject)
const updateRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const landlordId = req.user?.id as string;
    const payload = req.body;
    const result = await rentalService.updateRentalRequestStatusDB(
      id as string,
      landlordId,
      payload,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Rental request ${result.status.toLowerCase()} successfully`,
      data: result,
    });
    next();
  },
);

export const rentalController = {
  submitRentalRequest,
  getRentalRequest,
  getRentalRequestById,
  getAllRentalRequests,
  updateRentalRequest,
};
