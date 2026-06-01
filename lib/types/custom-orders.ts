export type BespokeOrderStatus =
  | 'request_submitted'
  | 'seller_reviewing'
  | 'quote_sent'
  | 'quote_approved'
  | 'deposit_paid'
  | 'in_progress'
  | 'final_payment_pending'
  | 'fully_paid'
  | 'ready_for_delivery'
  | 'completed'
  | 'cancelled'
  | 'quote_declined'
  | 'revision_requested';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'revision_requested' | 'superseded';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';
export type CustomPaymentType = 'deposit' | 'final_payment' | 'adjustment';
export type CustomPaymentStatus = 'pending' | 'marked_paid' | 'cancelled';

export const bespokeStatusLabels: Record<string, string> = {
  request_submitted: 'Request submitted',
  seller_reviewing: 'Seller reviewing',
  quote_sent: 'Quote sent',
  quote_approved: 'Quote approved',
  deposit_paid: 'Deposit paid',
  in_progress: 'In progress',
  final_payment_pending: 'Final payment pending',
  fully_paid: 'Fully paid',
  ready_for_delivery: 'Ready for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
  quote_declined: 'Quote declined',
  revision_requested: 'Revision requested'
};

export function customOrderNextAction(status: string) {
  return ({
    request_submitted: 'Waiting for artisan review',
    seller_reviewing: 'Artisan is preparing a quote',
    quote_sent: 'Review quotation',
    revision_requested: 'Waiting for revised quote',
    quote_approved: 'Waiting for deposit confirmation',
    deposit_paid: 'Artisan can start production',
    in_progress: 'Project milestones in progress',
    final_payment_pending: 'Waiting for final payment confirmation',
    fully_paid: 'Ready to arrange delivery',
    ready_for_delivery: 'Delivery can be completed',
    completed: 'Completed',
    quote_declined: 'Quote declined',
    cancelled: 'Cancelled'
  } as Record<string, string>)[status] || status;
}
