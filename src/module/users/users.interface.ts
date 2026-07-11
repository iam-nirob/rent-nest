export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
}
