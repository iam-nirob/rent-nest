import { prisma } from "../../lib/prisma";
import { createHttpError } from "../../utils/appError";
import {
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
} from "./category.interface";

// Public: list all categories (apartment, house, studio, etc)
const getCategoriesDB = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { properties: true } } },
  });
  return categories;
};

// Admin: create a new category
const createCategoryDB = async (payload: ICreateCategoryPayload) => {
  const existing = await prisma.category.findUnique({
    where: { name: payload.name },
  });
  if (existing) {
    throw createHttpError("A category with this name already exists", 400);
  }
  const category = await prisma.category.create({ data: payload });
  return category;
};

// Admin: update a category
const updateCategoryDB = async (
  id: string,
  payload: IUpdateCategoryPayload,
) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw createHttpError("Category not found", 404);
  }
  const updated = await prisma.category.update({
    where: { id },
    data: payload,
  });
  return updated;
};

// Admin: delete a category
const deleteCategoryDB = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw createHttpError("Category not found", 404);
  }
  await prisma.category.delete({ where: { id } });
};

export const categoryService = {
  getCategoriesDB,
  createCategoryDB,
  updateCategoryDB,
  deleteCategoryDB,
};
