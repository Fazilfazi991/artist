import { z } from 'zod';
import { phoneSchema } from './shared';

export const addressSchema = z.object({ label: z.string().min(2), full_name: z.string().min(2), phone: phoneSchema, address_line_1: z.string().min(4), address_line_2: z.string().optional(), city: z.string().min(2), state: z.string().min(2), postal_code: z.string().min(4), country: z.string().default('India'), is_default: z.boolean().default(false) });
