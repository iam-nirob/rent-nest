import { prisma } from "../../lib/prisma";
import { RentalRequest } from "./rental.interface";

const createHttpError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

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
    select: { id: true },
  });

  if (!property) {
    throw createHttpError("Property not found", 404);
  }

  const newRentalRequest = await prisma.rentalRequest.create({
    data: {
      ...rentalRequest,
      tenantId: user.id,
    },
  });
  return newRentalRequest;
};
const getRentalRequestDB = async (id: string) => {};
const getAllRentalRequestsDB = async () => {};
const updateRentalRequestDB = async (
  id: string,
  rentalRequest: Partial<RentalRequest>,
) => {};
export const rentalService = {
  submitRentalRequestDB,
  getRentalRequestDB,
  getAllRentalRequestsDB,
  updateRentalRequestDB,
};
