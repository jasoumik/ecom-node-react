export class CreateUserDto {
  name: string;
  phone: string;
  email?: string;
  password?: string; // Optional, can be auto-generated or set later
  role?: string;
}
