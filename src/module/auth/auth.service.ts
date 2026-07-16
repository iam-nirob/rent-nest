import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { loginUser } from "./auth.interace";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";

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
  return {
    accessToken,
  };
};
export const authService = {
  loginUserDB,
};
