import { z } from 'zod';
import { addressSchema } from './address';

export const checkoutAddressSchema = addressSchema.extend({
  id: z.string().uuid().optional()
});

export const checkoutReviewSchema = z.object({
  address_id: z.string().uuid(),
  checkout_token: z.string().min(12),
  buyer_notes: z.string().max(1000).optional()
});
