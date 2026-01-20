export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
}
