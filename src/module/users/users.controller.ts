import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/cathcAsync";
import { usersService } from "./users.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

// POST /api/auth/register
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await usersService.createUserDB(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered successfully",
      data: user,
    });
    next();
  },
);

// Kept for reuse by the admin module
const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await usersService.getUserDB();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Users fetched successfully",
      data: users,
    });
    next();
  },
);

const getUsersId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await usersService.getUsersIdDB(id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User fetched successfully",
      data: user,
    });
    next();
  },
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userData = req.body;
    const user = await usersService.updateUserDB(id as string, userData);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User updated successfully",
      data: user,
    });
    next();
  },
);

const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await usersService.deleteUserDB(id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User deleted successfully",
      data: user,
    });
    next();
  },
);

// GET /api/auth/me
const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const user = await usersService.getMyProfileDB(userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile fetched successfully",
      data: user,
    });
    next();
  },
);

// PATCH /api/auth/me
const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const payload = req.body;
    const user = await usersService.updateMyProfileDB(userId, payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile updated successfully",
      data: user,
    });
    next();
  },
);

export const usersController = {
  createUser,
  getUser,
  getUsersId,
  updateUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
};
