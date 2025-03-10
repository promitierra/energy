import { z } from 'zod';

export const tariffSchema = z.object({
  name: z.string(),
  type: z.enum(['fixed', 'variable']),
  basePrice: z.number().positive(),
  energyPrice: z.number().positive(),
  powerPrice: z.number().positive().optional(),
  timeRanges: z.array(
    z.object({
      startHour: z.number().min(0).max(23),
      endHour: z.number().min(0).max(23),
      multiplier: z.number().positive()
    })
  ).optional(),
  updatedAt: z.string().datetime()
});

export type TariffData = z.infer<typeof tariffSchema>;