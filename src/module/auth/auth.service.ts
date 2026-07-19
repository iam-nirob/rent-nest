import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { loginUser } from "./auth.interace";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { JwtPayload } from "jsonwebtoken";

const loginUserDB = async (userData: loginUser) => {
  const { email, password } = userData;
  const user = await prisma.users.findUniqueOrThrow({
    where: {
      email,
    },
  });

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error("Invalid password");
  }

  const { password: _, ...userWithoutPassword } = user;

  const jwtPayload = {
    id: userWithoutPassword.id,
    name: userWithoutPassword.name,
    email: userWithoutPassword.email,
    role: userWithoutPassword.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expire_in,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expire_in,
  );
  return {
    accessToken,
    refreshToken,
  };
};

const refreshTokenDB = async (refreshToken: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    config.jwt_refresh_secret,
  );
  if (!verifiedRefreshToken.success) {
    throw new Error(verifiedRefreshToken.error || "Invalid refresh token");
  }
  const { id } = verifiedRefreshToken.data as JwtPayload;
  const user = await prisma.users.findUniqueOrThrow({
    where: {
      id,
    },
  });
  if (user.status === "BANNED") {
    throw new Error("User is banned");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expire_in,
  );

  return {
    accessToken,
  };
};
export const authService = {
  loginUserDB,
  refreshTokenDB,
};
