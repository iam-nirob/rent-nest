import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../utils/cathcAsync";
import { jwtUtils } from "../utils/jwt";
import { createHttpError } from "../utils/appError";
import { prisma } from "../lib/prisma";
import config from "../config";
import { Role } from "../../generated/prisma/enums";

// Usage: auth() -> just requires a logged in user
//        auth(Role.ADMIN) -> requires a logged in ADMIN
//        auth(Role.LANDLORD, Role.ADMIN) -> requires LANDLORD or ADMIN
export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : req.headers.authorization;
    const token = req.cookies?.accessToken || bearerToken;

    if (!token) {
      throw createHttpError(
        "You are not logged in. Please log in to access this resource.",
        401,
      );
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw createHttpError(verifiedToken.error || "Invalid token", 401);
    }

    const { id, name, email, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw createHttpError(
        "Forbidden. You don't have permission to access this resource.",
        403,
      );
    }

    const user = await prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw createHttpError("User not found!", 404);
    }

    if (user.status === "BANNED") {
      throw createHttpError(
        "Your account has been banned. Please contact support.",
        403,
      );
    }

    req.user = { id, name, email, role };
    next();
  });
};
