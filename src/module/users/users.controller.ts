import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/cathcAsync";
import { usersService } from "./users.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await usersService.createUserDB(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User created successfully",
      data: user,
    });
    next();
  },
);
const getUser = async (userId: string) => {};
const getUsersId = async () => {};
const updateUser = async (userId: string, userData: any) => {};
const deleteUser = async (userId: string) => {};
export const usersController = {
  createUser,
  getUser,
  getUsersId,
  updateUser,
  deleteUser,
};
