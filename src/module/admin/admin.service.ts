import { prisma } from "../../lib/prisma";
import { createHttpError } from "../../utils/appError";
import { IAdminListQuery, IUpdateUserStatusPayload } from "./admin.interface";

// GET /api/admin/users
const getAllUsersDB = async () => {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return users;
};

// PATCH /api/admin/users/:id - ban / unban a user
const updateUserStatusDB = async (
  id: string,
  payload: IUpdateUserStatusPayload,
) => {
  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) {
    throw createHttpError("User not found", 404);
  }
  if (!["ACTIVE", "BANNED"].includes(payload.status)) {
    throw createHttpError("status must be ACTIVE or BANNED", 400);
  }

  const updated = await prisma.users.update({
    where: { id },
    data: { status: payload.status },
    omit: { password: true },
  });
  return updated;
};

// GET /api/admin/properties - all listings, any status
const getAllPropertiesDB = async (query: IAdminListQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const where = query.status ? { status: query.status as any } : {};

  const properties = await prisma.property.findMany({
    where,
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      landLord: { omit: { password: true } },
    },
  });

  const total = await prisma.property.count({ where });

  return {
    data: properties,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

// GET /api/admin/rentals - all rental requests, any status
const getAllRentalsDB = async (query: IAdminListQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const where = query.status ? { status: query.status as any } : {};

  const rentals = await prisma.rentalRequest.findMany({
    where,
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      property: true,
      tenant: { omit: { password: true } },
      payment: true,
    },
  });

  const total = await prisma.rentalRequest.count({ where });

  return {
    data: rentals,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

export const adminService = {
  getAllUsersDB,
  updateUserStatusDB,
  getAllPropertiesDB,
  getAllRentalsDB,
};
