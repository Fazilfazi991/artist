import { z } from 'zod';
import { priceSchema, uuidSchema } from './shared';

export const orderItemSchema = z.object({ product_id: uuidSchema, quantity: z.coerce.number().int().positive(), unit_price: priceSchema, variant_data: z.record(z.string(), z.unknown()).optional(), customization_data: z.record(z.string(), z.unknown()).optional() });
export const orderSchema = z.object({ buyer_id: uuidSchema, seller_id: uuidSchema, shipping_address: z.record(z.string(), z.unknown()), items: z.array(orderItemSchema).min(1), buyer_notes: z.string().optional() });
