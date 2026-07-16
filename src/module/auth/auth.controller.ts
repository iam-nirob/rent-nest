import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/cathcAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { accessToken, refreshToken } =
      await authService.loginUserDB(payload);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged in successfully",
      data: {
        accessToken,
        refreshToken,
        payload: {
          email: payload.email,
        },
      },
    });
    next();
  },
);

const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.cookies;
    const { accessToken } = await authService.refreshTokenDB(refreshToken);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Access token refreshed successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });
    next();
  },
);

export const authController = {
  loginUser,
  refreshToken,
};
