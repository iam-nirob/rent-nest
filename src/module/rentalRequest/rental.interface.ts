export interface RentalRequest {
  propertyId: string;
  moveInDate?: string | Date;
  moveOutDate?: string | Date;
  message?: string;
}

export interface IUpdateRentalRequestStatus {
  status: "APPROVED" | "CANCELED" | "ACTIVE" | "COMPLETED";
}

export interface IRentalQuery {
  status?: string;
  page?: string;
  limit?: string;
}
