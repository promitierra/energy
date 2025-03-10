import { z } from 'zod';

export const simulationParamsSchema = z.object({
  initialInvestment: z.number().positive(),
  systemLifespan: z.number().positive().int(),
  maintenanceCost: z.number().nonnegative(),
  annualDegradation: z.number().min(0).max(100),
  energyPriceInflation: z.number().min(-100).max(100),
  financingRate: z.number().min(0).max(100).optional(),
  financingYears: z.number().int().positive().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  incentives: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['rebate', 'taxCredit', 'grant']),
      amount: z.number().positive(),
      maxLimit: z.number().positive().optional(),
      expirationDate: z.string().datetime().optional()
    })
  ).optional(),
  updatedAt: z.string().datetime()
});

export type SimulationParams = z.infer<typeof simulationParamsSchema>;