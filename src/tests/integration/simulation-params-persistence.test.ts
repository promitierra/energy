import { loadSimulationParams } from '../../utils/simulationParamsLoader';
import { SimulationParams } from '../../schemas/simulationParamsSchema';
import simulationParamsData from '../../data/simulationParams.json';

describe('Simulation Parameters Data Persistence Integration', () => {
  let loadedParams: SimulationParams;

  beforeAll(() => {
    // Load the actual data from the JSON file
    loadedParams = loadSimulationParams();
  });

  describe('Data Structure Integrity', () => {
    it('should load the correct structure from JSON file', () => {
      expect(loadedParams).toHaveProperty('initialInvestment');
      expect(loadedParams).toHaveProperty('systemLifespan');
      expect(loadedParams).toHaveProperty('maintenanceCost');
      expect(loadedParams).toHaveProperty('annualDegradation');
      expect(loadedParams).toHaveProperty('energyPriceInflation');
      expect(loadedParams).toHaveProperty('updatedAt');
    });

    it('should have the same values as the source JSON', () => {
      expect(loadedParams.initialInvestment).toBe(simulationParamsData.initialInvestment);
      expect(loadedParams.systemLifespan).toBe(simulationParamsData.systemLifespan);
      expect(loadedParams.maintenanceCost).toBe(simulationParamsData.maintenanceCost);
      expect(loadedParams.annualDegradation).toBe(simulationParamsData.annualDegradation);
      expect(loadedParams.energyPriceInflation).toBe(simulationParamsData.energyPriceInflation);
    });
  });

  describe('Data Type Validation', () => {
    it('should have the correct data types for all properties', () => {
      expect(typeof loadedParams.initialInvestment).toBe('number');
      expect(typeof loadedParams.systemLifespan).toBe('number');
      expect(typeof loadedParams.maintenanceCost).toBe('number');
      expect(typeof loadedParams.annualDegradation).toBe('number');
      expect(typeof loadedParams.energyPriceInflation).toBe('number');
      expect(typeof loadedParams.updatedAt).toBe('string');
    });

    it('should have positive values for numeric properties', () => {
      expect(loadedParams.initialInvestment).toBeGreaterThan(0);
      expect(loadedParams.systemLifespan).toBeGreaterThan(0);
      expect(loadedParams.maintenanceCost).toBeGreaterThanOrEqual(0);
      expect(loadedParams.annualDegradation).toBeGreaterThanOrEqual(0);
      expect(loadedParams.energyPriceInflation).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Performance', () => {
    it('should load simulation parameters efficiently', () => {
      const startTime = performance.now();
      loadSimulationParams();
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // The data should load in less than 50ms
      // This threshold may need adjustment based on the actual performance
      expect(loadTime).toBeLessThan(50);
    });
  });

  describe('Date Format Validation', () => {
    it('should have a valid ISO date string for updatedAt', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      expect(loadedParams.updatedAt).toMatch(dateRegex);
      
      // Verify it's a valid date
      const date = new Date(loadedParams.updatedAt);
      expect(date.toString()).not.toBe('Invalid Date');
    });
  });
});