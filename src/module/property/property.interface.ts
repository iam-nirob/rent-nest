import { PropertyStatus } from "../../../generated/prisma/enums";

export interface ICreatePropertyPayload {
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqft?: number;
  amenities?: string[];
  images?: string[];
  status?: PropertyStatus;
  categoryId: string;
}

export interface IUpdatePropertyPayload {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqft?: number;
  amenities?: string[];
  images?: string[];
  status?: PropertyStatus;
  categoryId?: string;
}

export interface IPropertyQuery {
  searchTerms?: string;
  location?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  amenities?: string; // comma separated
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}
