import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const priceSchema = z.coerce.number().min(0).max(9999999999.99);
export const phoneSchema = z.string().regex(/^\+?[0-9\s-]{8,16}$/);
export const slugSchema = z.string().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const fileMetadataSchema = z.object({ name: z.string().min(1), size: z.number().positive(), type: z.string().min(1), storagePath: z.string().min(1) });
