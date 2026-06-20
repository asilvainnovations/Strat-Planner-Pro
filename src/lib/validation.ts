import { z } from "zod";

// SWOT Validation
export const SwotCategorySchema = z.enum([
  "strength",
  "weakness",
  "opportunity",
  "threat",
]);

export const CreateSwotItemSchema = z.object({
  planId: z.string().uuid("Invalid plan ID"),
  category: SwotCategorySchema,
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(500),
});

export const UpdateSwotItemSchema = CreateSwotItemSchema.extend({
  id: z.string().uuid(),
});

// Strategic Plan Validation
export const CreateStrategicPlanSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().max(1000).optional(),
  organizationName: z.string().max(255),
});

// KPI Validation
export const CreateKpiSchema = z.object({
  objectiveId: z.string().uuid(),
  name: z.string().min(3).max(255),
  baseline: z.number().min(0),
  target: z.number().min(0),
  current: z.number().min(0),
  unit: z.string().max(50),
});

// PAP Validation
export const CreatePapSchema = z.object({
  planId: z.string().uuid(),
  name: z.string().min(3).max(255),
  type: z.enum(["program", "activity", "project"]),
  budget: z.number().min(0),
  progress: z.number().min(0).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// AI Request Validation
export const AiGenerateSwotSchema = z.object({
  planId: z.string().uuid(),
  category: SwotCategorySchema,
  context: z.string().min(10).max(1000),
});

// Type exports for runtime type checking
export type CreateSwotItem = z.infer<typeof CreateSwotItemSchema>;
export type UpdateSwotItem = z.infer<typeof UpdateSwotItemSchema>;
export type CreateStrategicPlan = z.infer<typeof CreateStrategicPlanSchema>;
export type CreateKpi = z.infer<typeof CreateKpiSchema>;
export type CreatePap = z.infer<typeof CreatePapSchema>;
export type AiGenerateSwot = z.infer<typeof AiGenerateSwotSchema>;
