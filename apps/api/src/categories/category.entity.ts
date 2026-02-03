export class Category {
  id: string;
  name: string;
  name_bn?: string;
  description?: string;
  description_bn?: string;
  image?: string;
  parent_id?: string;
  age_group_id?: string;
  children?: Category[];
  created_at: Date;
  updated_at: Date;
}
