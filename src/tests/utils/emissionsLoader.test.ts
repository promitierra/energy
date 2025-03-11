import { loadEmissionsData, getEnergySourceByName, getEnergySourcesByType, getConversionFactor, getConversionFactorsByContext } from '../../utils/emissionsLoader';
import { emissionsSchema } from '../../schemas/emissionsSchema';
import { z } from 'zod';

// Mock the emissions data import
jest.mock('../../data/emissions.json', () => ({
  energySources: [
    {
      name: 'Solar PV',
      type: 'renewable',
      co2PerKWh: 41,
      lifecycleEmissions: 6,
      conversionEfficiency: 20,
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      name: 'Natural Gas',
      type: 'fossil',
      co2PerKWh: 490,
      lifecycleEmissions: 78,
      conversionEfficiency: 60,
      updatedAt: '2024-01-15T00:00:00Z'
    }
  ],
  conversionFactors: [
    {
      fromUnit: 'kWh',
      toUnit: 'MWh',
      factor: 0.001,
      context: 'energy'
    },
    {
      fromUnit: 'gCO2',
      toUnit: 'kgCO2',
      factor: 0.001,
      context: 'emissions'
    }
  ]
}));

// Mock console.error to prevent test output pollution
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  jest.resetAllMocks();
});

describe('Emissions Data Loader', () => {
  describe('loadEmissionsData', () => {
    it('should load and validate emissions data successfully', () => {
      const data = loadEmissionsData();
      expect(data).toBeDefined();
      expect(data.energySources).toHaveLength(2);
      expect(data.conversionFactors).toHaveLength(2);
    });

    it('should throw an error when validation fails', () => {
      // Mock implementation to simulate validation failure
      jest.spyOn(emissionsSchema, 'safeParse').mockImplementationOnce(() => ({
        success: false,
        error: new z.ZodError([
          {
            code: 'invalid_type',
            expected: 'number',
            received: 'string',
            path: ['energySources', 0, 'co2PerKWh'],
            message: 'Validation failed'
          }
        ])
      }));

      expect(() => loadEmissionsData()).toThrow('Emissions data validation failed');
    });
  });

  describe('getEnergySourceByName', () => {
    it('should return the correct energy source by name', () => {
      const source = getEnergySourceByName('Solar PV');
      expect(source).toBeDefined();
      expect(source?.name).toBe('Solar PV');
      expect(source?.type).toBe('renewable');
    });

    it('should return undefined for non-existent energy source', () => {
      const source = getEnergySourceByName('Non-existent Source');
      expect(source).toBeUndefined();
    });
  });

  describe('getEnergySourcesByType', () => {
    it('should return all energy sources of a specific type', () => {
      const renewableSources = getEnergySourcesByType('renewable');
      expect(renewableSources).toHaveLength(1);
      expect(renewableSources[0].name).toBe('Solar PV');

      const fossilSources = getEnergySourcesByType('fossil');
      expect(fossilSources).toHaveLength(1);
      expect(fossilSources[0].name).toBe('Natural Gas');
    });

    it('should return an empty array for types with no sources', () => {
      const hybridSources = getEnergySourcesByType('hybrid');
      expect(hybridSources).toEqual([]);
    });
  });

  describe('getConversionFactor', () => {
    it('should return the correct conversion factor by units', () => {
      const factor = getConversionFactor('kWh', 'MWh');
      expect(factor).toBeDefined();
      expect(factor?.factor).toBe(0.001);
      expect(factor?.context).toBe('energy');
    });

    it('should return undefined for non-existent conversion factor', () => {
      const factor = getConversionFactor('nonexistent', 'unit');
      expect(factor).toBeUndefined();
    });
  });

  describe('getConversionFactorsByContext', () => {
    it('should return all conversion factors for a specific context', () => {
      const energyFactors = getConversionFactorsByContext('energy');
      expect(energyFactors).toHaveLength(1);
      expect(energyFactors[0].fromUnit).toBe('kWh');

      const emissionsFactors = getConversionFactorsByContext('emissions');
      expect(emissionsFactors).toHaveLength(1);
      expect(emissionsFactors[0].fromUnit).toBe('gCO2');
    });

    it('should return an empty array for contexts with no factors', () => {
      const powerFactors = getConversionFactorsByContext('power');
      expect(powerFactors).toEqual([]);
    });
  });
});