export interface ICreateReviewPayload {
  rentalRequestId: string;
  rating: number;
  comment?: string;
}
