import { z } from 'zod';
import { priceSchema, uuidSchema } from './shared';

export const customOrderRequestSchema = z.object({ buyer_id: uuidSchema, seller_id: uuidSchema, product_id: uuidSchema.optional(), title: z.string().min(3), description: z.string().min(10), budget_min: priceSchema.optional(), budget_max: priceSchema.optional(), quantity: z.coerce.number().int().positive().optional(), deadline: z.string().date().optional(), delivery_location: z.string().optional(), reference_files: z.array(z.string()).optional() }).refine((value) => !value.budget_min || !value.budget_max || value.budget_min <= value.budget_max, { path: ['budget_max'], message: 'Maximum budget must be greater than minimum budget.' });
export const customOrderQuoteSchema = z.object({ request_id: uuidSchema, seller_id: uuidSchema, quote_amount: priceSchema, deposit_amount: priceSchema, final_amount: priceSchema, estimated_completion_date: z.string().date().optional(), quote_notes: z.string().optional() });
