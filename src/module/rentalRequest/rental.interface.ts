export interface RentalRequest {
  propertyId: string;
  moveInDate?: string | Date;
  moveOutDate?: string | Date;
  message?: string;
}
