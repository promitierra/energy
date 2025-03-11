import { tariffSchema } from '../../schemas/tariffSchema';

describe('Tariff Schema Validation', () => {
  it('validates a valid fixed tariff', () => {
    const validFixedTariff = {
      name: 'Test Fixed Tariff',
      type: 'fixed',
      basePrice: 3.45,
      energyPrice: 0.14,
      powerPrice: 44.44,
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const result = tariffSchema.safeParse(validFixedTariff);
    expect(result.success).toBe(true);
  });

  it('validates a valid variable tariff with time ranges', () => {
    const validVariableTariff = {
      name: 'Test Variable Tariff',
      type: 'variable',
      basePrice: 3.45,
      energyPrice: 0.12,
      powerPrice: 44.44,
      timeRanges: [
        {
          startHour: 0,
          endHour: 7,
          multiplier: 0.8
        }
      ],
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const result = tariffSchema.safeParse(validVariableTariff);
    expect(result.success).toBe(true);
  });

  it('rejects invalid tariff type', () => {
    const invalidTariff = {
      name: 'Invalid Tariff',
      type: 'invalid',
      basePrice: 3.45,
      energyPrice: 0.14,
      powerPrice: 44.44,
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const result = tariffSchema.safeParse(invalidTariff);
    expect(result.success).toBe(false);
  });

  it('rejects negative prices', () => {
    const invalidTariff = {
      name: 'Negative Price Tariff',
      type: 'fixed',
      basePrice: -3.45,
      energyPrice: 0.14,
      powerPrice: 44.44,
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const result = tariffSchema.safeParse(invalidTariff);
    expect(result.success).toBe(false);
  });

  it('rejects invalid time ranges', () => {
    const invalidTariff = {
      name: 'Invalid Time Range Tariff',
      type: 'variable',
      basePrice: 3.45,
      energyPrice: 0.12,
      powerPrice: 44.44,
      timeRanges: [
        {
          startHour: 25,
          endHour: 7,
          multiplier: 0.8
        }
      ],
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const result = tariffSchema.safeParse(invalidTariff);
    expect(result.success).toBe(false);
  });
});