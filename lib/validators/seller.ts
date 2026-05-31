import { z } from 'zod';
import { fileMetadataSchema, phoneSchema, slugSchema, uuidSchema } from './shared';

export const sellerDraftSchema = z.object({ store_name: z.string().min(2), store_slug: slugSchema });
export const sellerProfileSchema = sellerDraftSchema.extend({ short_bio: z.string().max(240).optional(), full_story: z.string().optional(), primary_category_id: uuidSchema.optional(), years_experience: z.coerce.number().int().min(0).optional(), city: z.string().min(2), state: z.string().min(2), instagram_url: z.string().url().optional(), whatsapp_number: phoneSchema.optional(), average_production_days: z.coerce.number().int().min(0).optional(), shipping_regions: z.array(z.string()).default(['India']), supports_ready_to_ship: z.boolean().default(false), supports_customized: z.boolean().default(false), supports_bespoke: z.boolean().default(false) });
export const sellerDocumentSchema = z.object({ seller_id: uuidSchema, document_type: z.string().min(2), file: fileMetadataSchema });
export const sellerRejectionSchema = z.object({ seller_id: uuidSchema, reason: z.string().min(5) });
