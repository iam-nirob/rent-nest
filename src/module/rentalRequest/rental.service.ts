import { prisma } from "../../lib/prisma";
import { createHttpError } from "../../utils/appError";
import {
  IRentalQuery,
  IUpdateRentalRequestStatus,
  RentalRequest,
} from "./rental.interface";

const submitRentalRequestDB = async (
  rentalRequest: RentalRequest,
  userId: string,
) => {
  if (!rentalRequest.propertyId) {
    throw createHttpError("propertyId is required", 400);
  }

  const user = await prisma.users.findUniqueOrThrow({
    where: { id: userId },
  });

  const property = await prisma.property.findUnique({
    where: { id: rentalRequest.propertyId },
  });

  if (!property) {
    throw createHttpError("Property not found", 404);
  }

  if (property.status !== "AVAILABLE") {
    throw createHttpError("This property is not available for rent", 400);
  }

  if (property.landLordId === userId) {
    throw createHttpError(
      "You cannot submit a rental request on your own property",
      400,
    );
  }

  const newRentalRequest = await prisma.rentalRequest.create({
    data: {
      propertyId: rentalRequest.propertyId,
      moveInDate: rentalRequest.moveInDate
        ? new Date(rentalRequest.moveInDate)
        : undefined,
      moveOutDate: rentalRequest.moveOutDate
        ? new Date(rentalRequest.moveOutDate)
        : undefined,
      message: rentalRequest.message,
      tenantId: user.id,
    },
    include: {
      property: true,
    },
  });
  return newRentalRequest;
};

// Tenant: view own rental request history (pending/approved/rejected/etc)
const getMyRentalRequestsDB = async (tenantId: string, query: IRentalQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const requests = await prisma.rentalRequest.findMany({
    where: {
      tenantId,
      ...(query.status ? { status: query.status as any } : {}),
    },
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      property: true,
      payment: true,
    },
  });

  const total = await prisma.rentalRequest.count({
    where: {
      tenantId,
      ...(query.status ? { status: query.status as any } : {}),
    },
  });

  return {
    data: requests,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

// Tenant/Landlord/Admin: view a single rental request they're party to
const getRentalRequestByIdDB = async (
  id: string,
  userId: string,
  role: string,
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      property: true,
      tenant: { omit: { password: true } },
      payment: true,
    },
  });

  if (!rentalRequest) {
    throw createHttpError("Rental request not found", 404);
  }

  const isOwnerTenant = rentalRequest.tenantId === userId;
  const isOwnerLandlord = rentalRequest.property.landLordId === userId;
  const isAdmin = role === "ADMIN";

  if (!isOwnerTenant && !isOwnerLandlord && !isAdmin) {
    throw createHttpError(
      "You don't have permission to view this rental request",
      403,
    );
  }

  return rentalRequest;
};

// Landlord: view all rental requests submitted for their properties
const getLandlordRentalRequestsDB = async (
  landlordId: string,
  query: IRentalQuery,
) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const where = {
    property: { landLordId: landlordId },
    ...(query.status ? { status: query.status as any } : {}),
  };

  const requests = await prisma.rentalRequest.findMany({
    where,
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      property: true,
      tenant: { omit: { password: true } },
    },
  });

  const total = await prisma.rentalRequest.count({ where });

  return {
    data: requests,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

// Landlord: approve or reject(cancel) a rental request for their own property
const updateRentalRequestStatusDB = async (
  id: string,
  landlordId: string,
  payload: IUpdateRentalRequestStatus,
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id },
    include: { property: true },
  });

  if (!rentalRequest) {
    throw createHttpError("Rental request not found", 404);
  }

  if (rentalRequest.property.landLordId !== landlordId) {
    throw createHttpError(
      "You are not the owner of this property's listing",
      403,
    );
  }

  if (rentalRequest.status !== "PENDING") {
    throw createHttpError(
      `This rental request has already been ${rentalRequest.status.toLowerCase()}`,
      400,
    );
  }

  if (!["APPROVED", "CANCELED"].includes(payload.status)) {
    throw createHttpError(
      "status must be either APPROVED or CANCELED",
      400,
    );
  }

  const updated = await prisma.rentalRequest.update({
    where: { id },
    data: { status: payload.status },
    include: { property: true, tenant: { omit: { password: true } } },
  });

  return updated;
};

export const rentalService = {
  submitRentalRequestDB,
  getMyRentalRequestsDB,
  getRentalRequestByIdDB,
  getLandlordRentalRequestsDB,
  updateRentalRequestStatusDB,
};
