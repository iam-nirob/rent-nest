import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/cathcAsync";
import { propertyService } from "./property.service";
import { sendResponse } from "../../utils/sendResponse";

// GET /api/properties
const getProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await propertyService.getPropertiesDB(req.query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Properties retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
    next();
  },
);

// GET /api/properties/:id
const getPropertyById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await propertyService.getPropertyByIdDB(id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property retrieved successfully",
      data: result,
    });
    next();
  },
);

// GET /api/landlord/properties
const getMyProperties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landLordId = req.user?.id as string;
    const result = await propertyService.getMyPropertiesDB(
      landLordId,
      req.query,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Your properties retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
    next();
  },
);

// POST /api/landlord/properties
const createProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landLordId = req.user?.id as string;
    const payload = req.body;
    const result = await propertyService.createPropertyDB(
      payload,
      landLordId,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Property listing created successfully",
      data: result,
    });
    next();
  },
);

// PUT /api/landlord/properties/:id
const updateProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const landLordId = req.user?.id as string;
    const isAdmin = req.user?.role === "ADMIN";
    const payload = req.body;
    const result = await propertyService.updatePropertyDB(
      id as string,
      payload,
      landLordId,
      isAdmin,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property listing updated successfully",
      data: result,
    });
    next();
  },
);

// DELETE /api/landlord/properties/:id
const deleteProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const landLordId = req.user?.id as string;
    const isAdmin = req.user?.role === "ADMIN";
    await propertyService.deletePropertyDB(
      id as string,
      landLordId,
      isAdmin,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property listing removed successfully",
      data: null,
    });
    next();
  },
);

export const propertyController = {
  getProperties,
  getPropertyById,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
};
