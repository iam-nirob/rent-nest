import { Role } from "../../../generated/prisma/enums";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
  // Users choose their role at registration time (TENANT or LANDLORD).
  // ADMIN accounts should never be self-registered through this endpoint.
  role?: Role;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  avatarUrl?: string;
}
