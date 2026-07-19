import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { CreateUserPayload, UpdateUserPayload } from "./users.interface";
import config from "../../config";
import { createHttpError } from "../../utils/appError";
import { Role } from "../../../generated/prisma/enums";

const createUserDB = async (payload: CreateUserPayload) => {
  const { name, email, password, phone, avatarUrl, role } = payload;
  const existingUser = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw createHttpError("User with this email already exists", 400);
  }

  // Users can only self-register as TENANT or LANDLORD; ADMIN accounts are
  // provisioned separately and never through the public register endpoint.
  const requestedRole = role === Role.LANDLORD ? Role.LANDLORD : Role.TENANT;

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      avatarUrl,
      role: requestedRole,
    },
  });
  const user = await prisma.users.findUniqueOrThrow({
    where: {
      id: createdUser.id,
      email: createdUser.email || email,
    },
    omit: {
      password: true,
    },
  });
  return user;
};

// Kept for reuse by the admin module (list all users)
const getUserDB = async () => {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return users;
};

// Kept for reuse by the admin module (view a single user)
const getUsersIdDB = async (userId: string) => {
  const user = await prisma.users.findUniqueOrThrow({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
  });
  return user;
};

const updateUserDB = async (id: string, userData: UpdateUserPayload) => {
  if (userData.password) {
    userData.password = await bcrypt.hash(
      userData.password,
      Number(config.bcrypt_salt_rounds),
    );
  }
  const user = await prisma.users.update({
    where: {
      id,
    },
    data: userData,
    omit: {
      password: true,
    },
  });
  return user;
};

const deleteUserDB = async (id: string) => {
  const user = await prisma.users.delete({
    where: {
      id,
    },
  });
  return user;
};

// Tenant/Landlord/Admin: view own profile -> GET /api/auth/me
const getMyProfileDB = async (userId: string) => {
  const user = await prisma.users.findUniqueOrThrow({
    where: { id: userId },
    omit: { password: true },
  });
  return user;
};

// Tenant/Landlord: update own profile
const updateMyProfileDB = async (
  userId: string,
  payload: UpdateUserPayload,
) => {
  return updateUserDB(userId, payload);
};

export const usersService = {
  createUserDB,
  getUserDB,
  getUsersIdDB,
  updateUserDB,
  deleteUserDB,
  getMyProfileDB,
  updateMyProfileDB,
};
