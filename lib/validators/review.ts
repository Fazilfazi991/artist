import { z } from 'zod';
import { uuidSchema } from './shared';

export const reviewSchema = z.object({ order_id: uuidSchema, buyer_id: uuidSchema, seller_id: uuidSchema, product_id: uuidSchema, rating: z.coerce.number().int().min(1).max(5), title: z.string().max(120).optional(), review_text: z.string().min(5), image_urls: z.array(z.string()).optional() });
