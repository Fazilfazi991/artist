import { z } from 'zod';

export const uuidInput = z.string().uuid();

export const progressUpdateSchema = z.object({
  order_id: uuidInput,
  title: z.string().min(3).max(120),
  message: z.string().max(1000).optional(),
  is_visible_to_buyer: z.boolean().default(true)
});

export const dispatchOrderSchema = z.object({
  order_id: uuidInput,
  courier_name: z.string().min(2).max(120),
  tracking_number: z.string().min(2).max(120),
  tracking_url: z.string().url().optional().or(z.literal(''))
});

export const orderIssueSchema = z.object({
  order_id: uuidInput,
  issue_type: z.enum(['delivery_delay','damaged_item','incorrect_item','customization_issue','missing_item','other']),
  subject: z.string().min(3).max(160),
  description: z.string().min(10).max(2000)
});

export const adminOverrideSchema = z.object({
  order_id: uuidInput,
  status: z.enum(['pending_payment','paid','seller_confirmed','in_production','ready_to_ship','dispatched','delivered','completed','cancelled','refund_requested','refunded']),
  reason: z.string().min(5).max(1000)
});
