import { z } from 'zod';
import { phoneSchema } from './shared';

export const registerBuyerSchema = z.object({ email: z.string().email(), password: z.string().min(8), fullName: z.string().min(2) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const profileSchema = z.object({ full_name: z.string().min(2), phone: phoneSchema.optional(), avatar_url: z.string().url().optional() });
