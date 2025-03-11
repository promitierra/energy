import { z } from 'zod';
import { tariffSchema } from '../../schemas/tariffSchema';
import { simulationParamsSchema } from '../../schemas/simulationParamsSchema';
import { emissionsSchema } from '../../schemas/emissionsSchema';
import { loadTariffs } from '../../utils/tariffLoader';
import { loadSimulationParams } from '../../utils/simulationParamsLoader';
import { loadEmissionsData } from '../../utils/emissionsLoader';

describe('Schema Validation Integration Tests', () => {
  describe('Tariff Schema Validation', () => {
    it('should validate valid tariff data', () => {
      // Create a valid tariff object
      const validTariff = {
        name: 'Test Tariff',
        type: 'fixed' as const,
        basePrice: 3.50,
        energyPrice: 0.15,
        powerPrice: 45.00,
        updatedAt: new Date().toISOString()
      };
      
      // Validate against schema
      const result = tariffSchema.safeParse(validTariff);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid tariff data', () => {
      // Create an invalid tariff object (negative price)
      const invalidTariff = {
        name: 'Invalid Tariff',
        type: 'fixed' as const,
        basePrice: -3.50, // Invalid: negative price
        energyPrice: 0.15,
        powerPrice: 45.00,
        updatedAt: new Date().toISOString()
      };
      
      // Validate against schema
      const result = tariffSchema.safeParse(invalidTariff);
      expect(result.success).toBe(false);
      
      // Check that the error is about the negative price
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('basePrice');
      }
    });
    
    it('should reject tariff with invalid type', () => {
      // Create an invalid tariff object (invalid type)
      const invalidTariff = {
        name: 'Invalid Type Tariff',
        type: 'dynamic' as any, // Invalid: not in enum
        basePrice: 3.50,
        energyPrice: 0.15,
        powerPrice: 45.00,
        updatedAt: new Date().toISOString()
      };
      
      // Validate against schema
      const result = tariffSchema.safeParse(invalidTariff);
      expect(result.success).toBe(false);
      
      // Check that the error is about the invalid type
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('type');
      }
    });
    
    it('should reject tariff with missing required fields', () => {
      // Create an invalid tariff object (missing required fields)
      const invalidTariff = {
        name: 'Missing Fields Tariff',
        type: 'fixed' as const,
        // Missing basePrice and energyPrice
        updatedAt: new Date().toISOString()
      };
      
      // Validate against schema
      const result = tariffSchema.safeParse(invalidTariff);
      expect(result.success).toBe(false);
      
      // Check that the errors mention the missing fields
      if (!result.success) {
        const errorPaths = result.error.issues.map(issue => issue.path.join('.'));
        expect(errorPaths).toContain('basePrice');
        expect(errorPaths).toContain('energyPrice');
      }
    });
  });
  
  describe('Simulation Parameters Schema Validation', () => {
    it('should validate valid simulation parameters', () => {
      // Create valid simulation parameters
      const validParams = {
        initialInvestment: 10000,
        systemLifespan: 25,
        maintenanceCost: 200,
        annualDegradation: 0.5,
        energyPriceInflation: 2.5,
        updatedAt: new Date().toISOString()
      };
      
      // Validate against schema
      const result = simulationParamsSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });
    
    it('should reject simulation parameters with out-of-range values', () => {
      // Create invalid simulation parameters (out of range values)
      const invalidParams = {
        initialInvestment: 10000,
        systemLifespan: 25,
        maintenanceCost: 200,
        annualDegradation: 101, // Invalid: > 100%
        energyPriceInflation: 2.5,
        updatedAt: new Date().toISOString()
      };
      
      // Validate against schema
      const result = simulationParamsSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
      
      // Check that the error is about the out-of-range value
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('annualDegradation');
      }
    });
    
    it('should validate optional incentives correctly', () => {
      // Create valid simulation parameters with incentives
      const validParams = {
        initialInvestment: 10000,
        systemLifespan: 25,
        maintenanceCost: 200,
        annualDegradation: 0.5,
        energyPriceInflation: 2.5,
        incentives: [
          {
            name: 'Test Incentive',
            type: 'rebate' as const,
            amount: 1000,
            maxLimit: 2000,
            expirationDate: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString()
      };
      
      // Validate against schema
      const result = simulationParamsSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid incentive data', () => {
      // Create simulation parameters with invalid incentive
      const invalidParams = {
        initialInvestment: 10000,
        systemLifespan: 25,
        maintenanceCost: 200,
        annualDegradation: 0.5,
        energyPriceInflation: 2.5,
        incentives: [
          {
            name: 'Invalid Incentive',
            type: 'discount' as any, // Invalid: not in enum
            amount: 1000,
            maxLimit: 2000,
            expirationDate: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString()
      };
      
      // Validate against schema
      const result = simulationParamsSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
      
      // Check that the error is about the invalid incentive type
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('incentives');
        expect(result.error.issues[0].path).toContain('type');
      }
    });
  });
  
  describe('Emissions Schema Validation', () => {
    it('should validate valid emissions data', () => {
      // Create valid emissions data
      const validEmissions = {
        energySources: [
          {
            name: 'Test Source',
            type: 'renewable' as const,
            co2PerKWh: 41,
            lifecycleEmissions: 6,
            conversionEfficiency: 20,
            updatedAt: new Date().toISOString()
          }
        ],
        conversionFactors: [
          {
            fromUnit: 'kWh',
            toUnit: 'MWh',
            factor: 0.001,
            context: 'energy' as const
          }
        ]
      };
      
      // Validate against schema
      const result = emissionsSchema.safeParse(validEmissions);
      expect(result.success).toBe(true);
    });
    
    it('should reject emissions data with invalid energy source type', () => {
      // Create emissions data with invalid energy source type
      const invalidEmissions = {
        energySources: [
          {
            name: 'Invalid Source',
            type: 'alternative' as any, // Invalid: not in enum
            co2PerKWh: 41,
            lifecycleEmissions: 6,
            conversionEfficiency: 20,
            updatedAt: new Date().toISOString()
          }
        ],
        conversionFactors: [
          {
            fromUnit: 'kWh',
            toUnit: 'MWh',
            factor: 0.001,
            context: 'energy' as const
          }
        ]
      };
      
      // Validate against schema
      const result = emissionsSchema.safeParse(invalidEmissions);
      expect(result.success).toBe(false);
      
      // Check that the error is about the invalid energy source type
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('energySources');
        expect(result.error.issues[0].path).toContain('type');
      }
    });
    
    it('should reject emissions data with invalid conversion factor context', () => {
      // Create emissions data with invalid conversion factor context
      const invalidEmissions = {
        energySources: [
          {
            name: 'Test Source',
            type: 'renewable' as const,
            co2PerKWh: 41,
            lifecycleEmissions: 6,
            conversionEfficiency: 20,
            updatedAt: new Date().toISOString()
          }
        ],
        conversionFactors: [
          {
            fromUnit: 'kWh',
            toUnit: 'MWh',
            factor: 0.001,
            context: 'other' as any // Invalid: not in enum
          }
        ]
      };
      
      // Validate against schema
      const result = emissionsSchema.safeParse(invalidEmissions);
      expect(result.success).toBe(false);
      
      // Check that the error is about the invalid conversion factor context
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('conversionFactors');
        expect(result.error.issues[0].path).toContain('context');
      }
    });
  });
  
  describe('Data Loader Error Handling', () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    beforeEach(() => {
      console.error = jest.fn();
    });
    
    afterEach(() => {
      console.error = originalConsoleError;
    });
    
    it('should handle schema validation errors in loaders', () => {
      // This test verifies that the loaders properly handle validation errors
      // We're not actually modifying the JSON files, just verifying the error handling
      
      // Verify that all loaders run without throwing errors
      expect(() => loadTariffs()).not.toThrow();
      expect(() => loadSimulationParams()).not.toThrow();
      expect(() => loadEmissionsData()).not.toThrow();
      
      // Mock a validation error by temporarily replacing the schema
      const originalTariffSchema = z.object({});
      Object.defineProperty(tariffSchema, 'safeParse', {
        value: () => ({ success: false, error: new z.ZodError([]) }),
        configurable: true
      });
      
      // Verify that the loader handles the validation error
      expect(() => loadTariffs()).toThrow();
      
      // Restore the original schema
      Object.defineProperty(tariffSchema, 'safeParse', {
        value: originalTariffSchema.safeParse,
        configurable: true
      });
    });
  });
});