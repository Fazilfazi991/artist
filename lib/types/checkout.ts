export type AddressSnapshot = {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

export type CreatedOrderSummary = {
  id: string;
  order_number: string;
  seller_id: string;
  seller_name: string;
  total_amount: number;
  status: string;
};
