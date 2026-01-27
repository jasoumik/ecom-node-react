export class CreateReviewDto {
  productId: string;
  userId: string;
  orderId: string;
  rating: number;
  comment?: string; // Made optional
  images?: string[];
}
