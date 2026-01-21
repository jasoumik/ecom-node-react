export class Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parent_id?: string;
  children?: Category[];
  created_at: Date;
  updated_at: Date;
}
