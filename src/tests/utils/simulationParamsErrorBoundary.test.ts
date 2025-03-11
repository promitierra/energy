import { simulationParamsSchema } from '../../schemas/simulationParamsSchema';
import { loadSimulationParams } from '../../utils/simulationParamsLoader';

// Mock the simulationParams.json import
jest.mock('../../data/simulationParams.json');

// Mock console.error to prevent test output pollution
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  jest.resetAllMocks();
});

describe('Simulation Parameters Error Boundary Tests', () => {
  describe('Schema Validation Errors', () => {
    it('should throw error for missing required fields', () => {
      // Mock invalid data with missing required fields
      jest.resetModules();
      jest.doMock('../../data/simulationParams.json', () => ({
        // Missing initialInvestment
        systemLifespan: 25,
        maintenanceCost: 200,
        annualDegradation: 0.5,
        energyPriceInflation: 2.5,
        updatedAt: '2024-01-01T00:00:00Z'
      }));
      
      // Reimport to get the mocked version
      const { loadSimulationParams } = require('../../utils/simulationParamsLoader');
      
      // Expect the function to throw an error
      expect(() => loadSimulationParams()).toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should throw error for invalid data types', () => {
      // Mock invalid data with wrong data types
      jest.resetModules();
      jest.doMock('../../data/simulationParams.json', () => ({
        initialInvestment: 'not a number', // String instead of number
        systemLifespan: 25,
        maintenanceCost: 200,
        annualDegradation: 0.5,
        energyPriceInflation: 2.5,
        updatedAt: '2024-01-01T00:00:00Z'
      }));
      
      // Reimport to get the mocked version
      const { loadSimulationParams } = require('../../utils/simulationParamsLoader');
      
      // Expect the function to throw an error
      expect(() => loadSimulationParams()).toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should throw error for out-of-range values', () => {
      // Mock invalid data with out-of-range values
      jest.resetModules();
      jest.doMock('../../data/simulationParams.json', () => ({
        initialInvestment: 10000,
        systemLifespan: 25,
        maintenanceCost: 200,
        annualDegradation: 101, // Over 100%
        energyPriceInflation: 2.5,
        updatedAt: '2024-01-01T00:00:00Z'
      }));
      
      // Reimport to get the mocked version
      const { loadSimulationParams } = require('../../utils/simulationParamsLoader');
      
      // Expect the function to throw an error
      expect(() => loadSimulationParams()).toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should throw error for invalid incentive structure', () => {
      // Mock invalid data with malformed incentive
      jest.resetModules();
      jest.doMock('../../data/simulationParams.json', () => ({
        initialInvestment: 10000,
        systemLifespan: 25,
        maintenanceCost: 200,
        annualDegradation: 0.5,
        energyPriceInflation: 2.5,
        incentives: [
          {
            name: 'Invalid Incentive',
            type: 'unknown', // Invalid type
            amount: 1000
          }
        ],
        updatedAt: '2024-01-01T00:00:00Z'
      }));
      
      // Reimport to get the mocked version
      const { loadSimulationParams } = require('../../utils/simulationParamsLoader');
      
      // Expect the function to throw an error
      expect(() => loadSimulationParams()).toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Runtime Error Handling', () => {
    it('should handle JSON parsing errors', () => {
      // Mock a scenario where JSON parsing fails
      jest.resetModules();
      jest.doMock('../../data/simulationParams.json', () => {
        throw new SyntaxError('Unexpected token in JSON');
      });
      
      // Reimport to get the mocked version
      const { loadSimulationParams } = require('../../utils/simulationParamsLoader');
      
      // Expect the function to throw an error
      expect(() => loadSimulationParams()).toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle unexpected data structure', () => {
      // Mock completely unexpected data structure
      jest.resetModules();
      jest.doMock('../../data/simulationParams.json', () => [
        'This is not an object',
        'but an array'
      ]);
      
      // Reimport to get the mocked version
      const { loadSimulationParams } = require('../../utils/simulationParamsLoader');
      
      // Expect the function to throw an error
      expect(() => loadSimulationParams()).toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});