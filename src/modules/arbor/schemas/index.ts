import { z } from 'zod'

export const treeCreateSchema = z.object({
    tree_code: z.string().min(1, "Tree code is required"),
    species_id: z.coerce.number().optional().or(z.literal('')),
    zone_id: z.coerce.number().optional().or(z.literal('')),
    action: z.enum(['pending', 'cut', 'trim', 'keep', 'monitor', 'treat', 'replant']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assigned_to: z.coerce.number().optional().or(z.literal('')),
    health_score: z.coerce.number().min(1).max(10).optional().or(z.literal('')),
    approx_age_yrs: z.coerce.number().optional().or(z.literal('')),
    height_m: z.coerce.number().optional().or(z.literal('')),
    trunk_diameter_cm: z.coerce.number().optional().or(z.literal('')),
    coord_x: z.coerce.number().optional().or(z.literal('')),
    coord_y: z.coerce.number().optional().or(z.literal('')),
    action_notes: z.string().optional(),
    public_notes: z.string().optional(),
    planting_date: z.string().optional().or(z.literal('')),
})

export const treeUpdateSchema = treeCreateSchema.partial()

export const treeActivitySchema = z.object({
    action_taken: z.string().min(1, "Action taken is required"),
    notes: z.string().optional()
})

export const treeHealthSchema = z.object({
    health_score: z.coerce.number().min(1).max(10),
    observed_issues: z.string().optional(),
    notes: z.string().optional()
})

export const treeContributorSchema = z.object({
    user_id: z.coerce.number(),
    role: z.string().min(1, "Role is required"),
    since_date: z.string().optional(),
    notes: z.string().optional(),
    is_public: z.boolean().optional()
})

export const speciesCreateSchema = z.object({
    common_name: z.string().min(1, "Common name is required"),
    scientific_name: z.string().min(1, "Scientific name is required"),
    description: z.string().optional(),
    fun_fact: z.string().optional()
})
export const speciesUpdateSchema = speciesCreateSchema.partial()

export const zoneCreateSchema = z.object({
    zone_code: z.string().min(1, "Zone code is required"),
    zone_name: z.string().min(1, "Zone name is required"),
    description: z.string().optional()
})
export const zoneUpdateSchema = zoneCreateSchema.partial()
