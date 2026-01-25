export class CreateReviewDto {
  productId: string;
  orderId: string;
  userId: string;
  rating: number;
  comment?: string;
  images?: string[];
}
