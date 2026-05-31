export type UserRole = 'buyer' | 'seller' | 'admin';
export type SellerStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'suspended';
export type ProductType = 'ready_to_ship' | 'customized' | 'bespoke';
export type ProductStatus = 'draft' | 'pending_review' | 'active' | 'hidden' | 'rejected' | 'archived';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      seller_status: SellerStatus;
      product_type: ProductType;
      product_status: ProductStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type SellerProfile = {
  id: string;
  user_id: string;
  store_name: string;
  store_slug: string;
  status: SellerStatus;
};

export type Product = {
  id: string;
  seller_id: string;
  category_id: string;
  name: string;
  slug: string;
  product_type: ProductType;
  status: ProductStatus;
  base_price: number | null;
};
