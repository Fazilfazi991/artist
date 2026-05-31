export type CartCustomizationValue = string | number | boolean | string[] | null | { path: string; name: string; type: string; size: number };

export type CartLine = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  variant_data: Record<string, unknown> | null;
  customization_data: Record<string, CartCustomizationValue> | null;
  products: any;
};

export type SellerCartGroup = {
  seller: {
    id: string;
    store_name: string;
    store_slug: string;
  };
  items: CartLine[];
  subtotal: number;
  shippingFee: number;
};

export type CartSummary = {
  cart: any | null;
  items: CartLine[];
  groups: SellerCartGroup[];
  subtotal: number;
  shippingFee: number;
  total: number;
  count: number;
  errors: string[];
};
