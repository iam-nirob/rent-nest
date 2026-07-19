import { prisma } from "../../lib/prisma";
import { createHttpError } from "../../utils/appError";
import {
  ICreatePropertyPayload,
  IPropertyQuery,
  IUpdatePropertyPayload,
} from "./property.interface";

// Public: browse all AVAILABLE properties with filters + pagination
const getPropertiesDB = async (query: IPropertyQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const amenitiesList = query.amenities
    ? query.amenities.split(",").map((a) => a.trim())
    : undefined;

  const where = {
    AND: [
      { status: "AVAILABLE" as const },
      query.searchTerms
        ? {
            OR: [
              {
                title: { contains: query.searchTerms, mode: "insensitive" as const },
              },
              {
                description: {
                  contains: query.searchTerms,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {},
      query.location
        ? { location: { contains: query.location, mode: "insensitive" as const } }
        : {},
      query.categoryId ? { categoryId: query.categoryId } : {},
      query.bedrooms ? { bedrooms: Number(query.bedrooms) } : {},
      query.minPrice || query.maxPrice
        ? {
            price: {
              ...(query.minPrice ? { gte: Number(query.minPrice) } : {}),
              ...(query.maxPrice ? { lte: Number(query.maxPrice) } : {}),
            },
          }
        : {},
      amenitiesList ? { amenities: { hasEvery: amenitiesList } } : {},
    ],
  };

  const properties = await prisma.property.findMany({
    where,
    take: limit,
    skip,
    orderBy: { [sortBy]: sortOrder },
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

// Public: property details
const getPropertyByIdDB = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      category: true,
      landLord: { omit: { password: true } },
      reviews: {
        include: { tenant: { omit: { password: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { reviews: true, rentalRequests: true } },
    },
  });

  if (!property) {
    throw createHttpError("Property not found", 404);
  }

  return property;
};

// Landlord: own listings
const getMyPropertiesDB = async (landLordId: string, query: IPropertyQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const properties = await prisma.property.findMany({
    where: { landLordId },
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: { select: { rentalRequests: true, reviews: true } },
    },
  });

  const total = await prisma.property.count({ where: { landLordId } });

  return {
    data: properties,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

// Landlord: create a new property listing
const createPropertyDB = async (
  payload: ICreatePropertyPayload,
  landLordId: string,
) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw createHttpError("Category not found", 404);
  }

  const property = await prisma.property.create({
    data: {
      ...payload,
      landLordId,
    },
    include: { category: true },
  });

  return property;
};

// Landlord: update own property (title, price, status/availability, etc)
const updatePropertyDB = async (
  id: string,
  payload: IUpdatePropertyPayload,
  landLordId: string,
  isAdmin: boolean,
) => {
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) {
    throw createHttpError("Property not found", 404);
  }

  if (!isAdmin && property.landLordId !== landLordId) {
    throw createHttpError("You are not the owner of this property", 403);
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });
    if (!category) {
      throw createHttpError("Category not found", 404);
    }
  }

  const updated = await prisma.property.update({
    where: { id },
    data: payload,
    include: { category: true },
  });

  return updated;
};

// Landlord: remove own property listing
const deletePropertyDB = async (
  id: string,
  landLordId: string,
  isAdmin: boolean,
) => {
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) {
    throw createHttpError("Property not found", 404);
  }

  if (!isAdmin && property.landLordId !== landLordId) {
    throw createHttpError("You are not the owner of this property", 403);
  }

  await prisma.property.delete({ where: { id } });
};

export const propertyService = {
  getPropertiesDB,
  getPropertyByIdDB,
  getMyPropertiesDB,
  createPropertyDB,
  updatePropertyDB,
  deletePropertyDB,
};
