export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  avatarUrl?: string;
}
