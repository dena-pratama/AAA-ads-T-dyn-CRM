
import * as z from "zod"

export const stageSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Stage name is required"),
    color: z.string().default("#3B82F6"), // Default blue
    order: z.number().int(),
    isGoal: z.boolean().default(false),
})

export const customFieldSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Field name is required"),
    type: z.enum(["text", "number", "select", "date"]),
    options: z.array(z.string()).optional(), // For 'select' type
    required: z.boolean().default(false),
})

export const pipelineSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
    clientId: z.string().min(1, "Client ID is required"),
    isDefault: z.boolean().default(false),
    isActive: z.boolean().default(true),
    stages: z.array(stageSchema),
    customFields: z.array(customFieldSchema),
})
