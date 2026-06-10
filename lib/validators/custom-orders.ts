import { z } from 'zod';
import { priceSchema, uuidSchema } from '@/lib/validators/shared';

export const customOrderRequestSchema = z.object({
  seller_id: uuidSchema,
  product_id: uuidSchema.optional(),
  title: z.string().min(3).max(140),
  description: z.string().min(20).max(5000),
  project_category: z.string().max(120).optional(),
  occasion: z.string().max(160).optional(),
  dimensions: z.string().max(500).optional(),
  preferred_materials: z.string().max(800).optional(),
  preferred_colors: z.string().max(500).optional(),
  flexibility: z.object({
    budget: z.boolean().default(false),
    deadline: z.boolean().default(false),
    design: z.boolean().default(false)
  }).default({ budget: false, deadline: false, design: false }),
  budget_min: priceSchema.optional(),
  budget_max: priceSchema.optional(),
  quantity: z.coerce.number().int().positive().optional(),
  deadline: z.string().date().optional(),
  delivery_location: z.string().max(240).optional(),
  buyer_notes: z.string().max(1000).optional(),
  reference_links: z.array(z.string().url()).max(10).default([])
}).superRefine((value, ctx) => {
  if (value.budget_min != null && value.budget_max != null && value.budget_min > value.budget_max) {
    ctx.addIssue({ code: 'custom', path: ['budget_max'], message: 'Maximum budget must be greater than minimum budget.' });
  }
});

export const customOrderQuoteSchema = z.object({
  request_id: uuidSchema,
  quote_amount: priceSchema,
  deposit_amount: priceSchema,
  final_amount: priceSchema,
  estimated_completion_date: z.string().date().optional(),
  quote_notes: z.string().max(3000).optional(),
  inclusions: z.array(z.string().min(1)).default([]),
  exclusions: z.array(z.string().min(1)).default([])
}).superRefine((value, ctx) => {
  if (Number(value.deposit_amount) + Number(value.final_amount) !== Number(value.quote_amount)) {
    ctx.addIssue({ code: 'custom', path: ['final_amount'], message: 'Deposit plus final amount must equal quote amount.' });
  }
});

export const customOrderMilestoneSchema = z.object({
  request_id: uuidSchema,
  title: z.string().min(2).max(140),
  description: z.string().max(2000).optional(),
  display_order: z.coerce.number().int().min(0).default(0),
  status: z.enum(['pending','in_progress','completed']).default('pending'),
  is_visible_to_buyer: z.boolean().default(true),
  requires_buyer_approval: z.boolean().default(false)
});
