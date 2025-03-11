import { loadTariffs } from '../../utils/tariffLoader';
import { tariffSchema } from '../../schemas/tariffSchema';
import * as tariffData from '../../data/tariffs.json';

// Mock the tariff data import
jest.mock('../../data/tariffs.json', () => ({
  tariffs: [
    {
      name: 'Tarifa Test',
      type: 'fixed',
      basePrice: 3.45,
      energyPrice: 0.14,
      powerPrice: 44.44,
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      name: 'Tarifa Test Variable',
      type: 'variable',
      basePrice: 3.45,
      energyPrice: 0.12,
      powerPrice: 44.44,
      timeRanges: [
        {
          startHour: 0,
          endHour: 7,
          multiplier: 0.8
        },
        {
          startHour: 8,
          endHour: 17,
          multiplier: 1.2
        },
        {
          startHour: 18,
          endHour: 23,
          multiplier: 1.5
        }
      ],
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]
}));

describe('Tariff Data Loading Tests', () => {
  describe('Schema Validation', () => {
    it('should validate a valid fixed tariff', () => {
      const validFixedTariff = {
        name: 'Valid Fixed Tariff',
        type: 'fixed',
        basePrice: 3.50,
        energyPrice: 0.15,
        powerPrice: 45.00,
        updatedAt: '2024-01-01T00:00:00Z'
      };
      
      const result = tariffSchema.safeParse(validFixedTariff);
      expect(result.success).toBe(true);
    });
    
    it('should validate a valid variable tariff', () => {
      const validVariableTariff = {
        name: 'Valid Variable Tariff',
        type: 'variable',
        basePrice: 3.50,
        energyPrice: 0.15,
        powerPrice: 45.00,
        timeRanges: [
          {
            startHour: 0,
            endHour: 7,
            multiplier: 0.8
          },
          {
            startHour: 8,
            endHour: 23,
            multiplier: 1.2
          }
        ],
        updatedAt: '2024-01-01T00:00:00Z'
      };
      
      const result = tariffSchema.safeParse(validVariableTariff);
      expect(result.success).toBe(true);
    });
    
    it('should reject a tariff with missing required fields', () => {
      const invalidTariff = {
        name: 'Invalid Tariff',
        type: 'fixed',
        // Missing basePrice
        energyPrice: 0.15,
        updatedAt: '2024-01-01T00:00:00Z'
      };
      
      const result = tariffSchema.safeParse(invalidTariff);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('basePrice');
      }
    });
    
    it('should reject a tariff with invalid field types', () => {
      const invalidTariff = {
        name: 'Invalid Tariff',
        type: 'fixed',
        basePrice: 'not-a-number', // Invalid type
        energyPrice: 0.15,
        powerPrice: 45.00,
        updatedAt: '2024-01-01T00:00:00Z'
      };
      
      const result = tariffSchema.safeParse(invalidTariff);
      expect(result.success).toBe(false);
    });
    
    it('should reject a tariff with negative prices', () => {
      const invalidTariff = {
        name: 'Invalid Tariff',
        type: 'fixed',
        basePrice: -3.50, // Negative price
        energyPrice: 0.15,
        powerPrice: 45.00,
        updatedAt: '2024-01-01T00:00:00Z'
      };
      
      const result = tariffSchema.safeParse(invalidTariff);
      expect(result.success).toBe(false);
    });
    
    it('should reject a variable tariff with invalid time ranges', () => {
      const invalidTariff = {
        name: 'Invalid Variable Tariff',
        type: 'variable',
        basePrice: 3.50,
        energyPrice: 0.15,
        powerPrice: 45.00,
        timeRanges: [
          {
            startHour: 0,
            endHour: 25, // Invalid hour (> 23)
            multiplier: 0.8
          }
        ],
        updatedAt: '2024-01-01T00:00:00Z'
      };
      
      const result = tariffSchema.safeParse(invalidTariff);
      expect(result.success).toBe(false);
    });
  });
  
  describe('Data Loading', () => {
    it('should load tariffs from JSON file', () => {
      const tariffs = loadTariffs();
      expect(tariffs).toHaveLength(2);
      expect(tariffs[0].name).toBe('Tarifa Test');
      expect(tariffs[1].name).toBe('Tarifa Test Variable');
    });
    
    it('should handle malformed JSON data', () => {
      // Override the mock to return malformed data
      jest.resetModules();
      jest.mock('../../data/tariffs.json', () => ({
        // Missing the tariffs array
        notTariffs: []
      }));
      
      // Reimport the module to use the new mock
      jest.isolateModules(() => {
        const { loadTariffs } = require('../../utils/tariffLoader');
        expect(() => loadTariffs()).toThrow();
      });
    });
    
    it('should handle empty tariffs array', () => {
      // Override the mock to return empty array
      jest.resetModules();
      jest.mock('../../data/tariffs.json', () => ({
        tariffs: []
      }));
      
      // Reimport the module to use the new mock
      jest.isolateModules(() => {
        const { loadTariffs } = require('../../utils/tariffLoader');
        const tariffs = loadTariffs();
        expect(tariffs).toHaveLength(0);
      });
    });
  });
});