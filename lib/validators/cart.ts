import { z } from 'zod';

export const addCartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().int().positive().max(99),
  variant_id: z.string().uuid().optional().or(z.literal(''))
});

export const updateCartQuantitySchema = z.object({
  item_id: z.string().uuid(),
  quantity: z.coerce.number().int().positive().max(99)
});

export const removeCartItemSchema = z.object({
  item_id: z.string().uuid()
});
