import { z } from 'zod';

export const emissionsSchema = z.object({
  energySources: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['renewable', 'fossil', 'nuclear', 'hybrid']),
      co2PerKWh: z.number().nonnegative(),
      lifecycleEmissions: z.number().nonnegative(),
      conversionEfficiency: z.number().min(0).max(100),
      updatedAt: z.string().datetime()
    })
  ),
  conversionFactors: z.array(
    z.object({
      fromUnit: z.string(),
      toUnit: z.string(),
      factor: z.number().positive(),
      context: z.enum(['energy', 'emissions', 'power']).optional(),
      notes: z.string().optional()
    })
  )
});

export type EmissionsData = z.infer<typeof emissionsSchema>;