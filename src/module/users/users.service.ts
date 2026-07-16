import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { CreateUserPayload, UpdateUserPayload } from "./users.interface";
import config from "../../config";

const createUserDB = async (payload: CreateUserPayload) => {
  const { name, email, password, phone, avatarUrl } = payload;
  const existingUser = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

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
const getUserDB = async () => {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
    },
  });
  return users;
};
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

export const usersService = {
  createUserDB,
  getUserDB,
  getUsersIdDB,
  updateUserDB,
  deleteUserDB,
};
