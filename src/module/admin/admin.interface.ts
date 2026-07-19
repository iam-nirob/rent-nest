export interface IUpdateUserStatusPayload {
  status: "ACTIVE" | "BANNED";
}

export interface IAdminListQuery {
  page?: string;
  limit?: string;
  status?: string;
}
