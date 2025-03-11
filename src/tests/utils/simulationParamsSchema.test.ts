import { simulationParamsSchema } from '../../schemas/simulationParamsSchema';

describe('Simulation Parameters Schema Validation', () => {
  it('validates valid simulation parameters', () => {
    const validParams = {
      initialInvestment: 10000,
      systemLifespan: 25,
      maintenanceCost: 200,
      annualDegradation: 0.5,
      energyPriceInflation: 2.5,
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const result = simulationParamsSchema.safeParse(validParams);
    expect(result.success).toBe(true);
  });

  it('validates parameters with optional fields', () => {
    const paramsWithOptionals = {
      initialInvestment: 15000,
      systemLifespan: 20,
      maintenanceCost: 300,
      annualDegradation: 0.7,
      energyPriceInflation: 3.0,
      financingRate: 4.5,
      financingYears: 10,
      taxRate: 21,
      incentives: [
        {
          name: 'Solar Tax Credit',
          type: 'taxCredit',
          amount: 3000,
          maxLimit: 5000,
          expirationDate: '2025-12-31T23:59:59Z'
        }
      ],
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const result = simulationParamsSchema.safeParse(paramsWithOptionals);
    expect(result.success).toBe(true);
  });

  it('rejects negative initial investment', () => {
    const invalidParams = {
      initialInvestment: -5000,
      systemLifespan: 25,
      maintenanceCost: 200,
      annualDegradation: 0.5,
      energyPriceInflation: 2.5,
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const result = simulationParamsSchema.safeParse(invalidParams);
    expect(result.success).toBe(false);
  });

  it('rejects invalid percentage values', () => {
    const invalidParams = {
      initialInvestment: 10000,
      systemLifespan: 25,
      maintenanceCost: 200,
      annualDegradation: 150,
      energyPriceInflation: 2.5,
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const result = simulationParamsSchema.safeParse(invalidParams);
    expect(result.success).toBe(false);
  });

  it('rejects invalid incentive type', () => {
    const invalidParams = {
      initialInvestment: 10000,
      systemLifespan: 25,
      maintenanceCost: 200,
      annualDegradation: 0.5,
      energyPriceInflation: 2.5,
      incentives: [
        {
          name: 'Invalid Incentive',
          type: 'invalid',
          amount: 1000
        }
      ],
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const result = simulationParamsSchema.safeParse(invalidParams);
    expect(result.success).toBe(false);
  });
});