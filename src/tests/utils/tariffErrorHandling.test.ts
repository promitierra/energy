import { tariffSchema } from '../../schemas/tariffSchema';
import { loadTariffs } from '../../utils/tariffLoader';

// Mock the tariffs.json import
jest.mock('../../data/tariffs.json');

// Mock console.error to prevent test output pollution
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  jest.resetAllMocks();
});

describe('Tariff Data Error Handling Tests', () => {
  describe('Schema Validation Errors', () => {
    it('should throw error for missing required fields', () => {
      // Mock invalid data with missing required fields
      jest.resetModules();
      jest.doMock('../../data/tariffs.json', () => ({
        tariffs: [
          {
            // Missing name
            type: 'fixed',
            basePrice: 3.45,
            energyPrice: 0.14,
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ]
      }));
      
      // Reimport to get the mocked version
      const { loadTariffs } = require('../../utils/tariffLoader');
      
      // Expect the function to throw an error
      expect(() => loadTariffs()).toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should throw error for invalid tariff type', () => {
      // Mock invalid data with wrong tariff type
      jest.resetModules();
      jest.doMock('../../data/tariffs.json', () => ({
        tariffs: [
          {
            name: 'Invalid Tariff',
            type: 'invalid', // Not 'fixed' or 'variable'
            basePrice: 3.45,
            energyPrice: 0.14,
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ]
      }));
      
      // Reimport to get the mocked version
      const { loadTariffs } = require('../../utils/tariffLoader');
      
      // Expect the function to throw an error
      expect(() => loadTariffs()).toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should throw error for negative prices', () => {
      // Mock invalid data with negative prices
      jest.resetModules();
      jest.doMock('../../data/tariffs.json', () => ({
        tariffs: [
          {
            name: 'Negative Price Tariff',
            type: 'fixed',
            basePrice: -3.45, // Negative price
            energyPrice: 0.14,
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ]
      }));
      
      // Reimport to get the mocked version
      const { loadTariffs } = require('../../utils/tariffLoader');
      
      // Expect the function to throw an error
      expect(() => loadTariffs()).toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should throw error for invalid time ranges', () => {
      // Mock invalid data with invalid time ranges
      jest.resetModules();
      jest.doMock('../../data/tariffs.json', () => ({
        tariffs: [
          {
            name: 'Invalid Time Range Tariff',
            type: 'variable',
            basePrice: 3.45,
            energyPrice: 0.14,
            timeRanges: [
              {
                startHour: 0,
                endHour: 25, // Invalid hour (should be 0-23)
                multiplier: 0.8
              }
            ],
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ]
      }));
      
      // Reimport to get the mocked version
      const { loadTariffs } = require('../../utils/tariffLoader');
      
      // Expect the function to throw an error
      expect(() => loadTariffs()).toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Runtime Error Handling', () => {
    it('should handle JSON parsing errors', () => {
      // Mock a scenario where JSON parsing fails
      jest.resetModules();
      jest.doMock('../../data/tariffs.json', () => {
        throw new SyntaxError('Unexpected token in JSON');
      });
      
      // Reimport to get the mocked version
      const { loadTariffs } = require('../../utils/tariffLoader');
      
      // Expect the function to throw an error
      expect(() => loadTariffs()).toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle unexpected data structure', () => {
      // Mock completely unexpected data structure
      jest.resetModules();
      jest.doMock('../../data/tariffs.json', () => [
        'This is not an object',
        'but an array'
      ]);
      
      // Reimport to get the mocked version
      const { loadTariffs } = require('../../utils/tariffLoader');
      
      // Expect the function to throw an error
      expect(() => loadTariffs()).toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});