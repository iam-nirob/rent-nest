import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { jwtUtils } from "../utils/jwt";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : undefined;
  const token = req.cookies?.accessToken || bearerToken;

  if (!token) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "Unauthorized: access token is required",
    });
  }

  const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
  const payload = verifiedToken.data as JwtPayload;

  req.user = {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };

  next();
};
