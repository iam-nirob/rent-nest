import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/cathcAsync";
import { reviewService } from "./review.service";
import { sendResponse } from "../../utils/sendResponse";

// POST /api/reviews
const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;
    const result = await reviewService.createReviewDB(req.body, tenantId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review submitted successfully",
      data: result,
    });
    next();
  },
);

export const reviewController = {
  createReview,
};
