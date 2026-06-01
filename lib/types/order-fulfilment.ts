export type StandardOrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'seller_confirmed'
  | 'in_production'
  | 'ready_to_ship'
  | 'dispatched'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refund_requested'
  | 'refunded';

export type ActorRole = 'buyer' | 'seller' | 'admin' | 'system';

export type OrderProgressInput = {
  orderId: string;
  title: string;
  message?: string;
  visibleToBuyer: boolean;
  files?: File[];
};
