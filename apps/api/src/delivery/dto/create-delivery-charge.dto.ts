export class CreateDeliveryChargeDto {
  name: string;
  name_bn?: string; // Added Bangla Name
  amount: number;
  is_active?: boolean;
}
