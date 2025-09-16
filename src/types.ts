export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  price: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

