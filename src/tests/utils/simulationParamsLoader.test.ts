import { loadSimulationParams } from '../../utils/simulationParamsLoader';
import { simulationParamsSchema } from '../../schemas/simulationParamsSchema';
import simulationParamsData from '../../data/simulationParams.json';

// Mock the JSON import
jest.mock('../../data/simulationParams.json', () => ({
  initialInvestment: 10000,
  systemLifespan: 25,
  maintenanceCost: 200,
  annualDegradation: 0.5,
  energyPriceInflation: 2.5,
  updatedAt: '2024-01-01T00:00:00Z'
}));

describe('Simulation Parameters Loader', () => {
  it('loads and validates simulation parameters successfully', () => {
    const params = loadSimulationParams();
    
    expect(params).toBeDefined();
    expect(params.initialInvestment).toBe(10000);
    expect(params.systemLifespan).toBe(25);
    expect(params.maintenanceCost).toBe(200);
    expect(params.annualDegradation).toBe(0.5);
    expect(params.energyPriceInflation).toBe(2.5);
  });

  it('throws an error when validation fails', () => {
    // Override the mock with invalid data
    jest.resetModules();
    jest.mock('../../data/simulationParams.json', () => ({
      initialInvestment: -5000, // Invalid negative value
      systemLifespan: 25,
      maintenanceCost: 200,
      annualDegradation: 0.5,
      energyPriceInflation: 2.5,
      updatedAt: '2024-01-01T00:00:00Z'
    }));
    
    // Need to reimport the loader to use the new mock
    jest.isolateModules(() => {
      const { loadSimulationParams } = require('../../utils/simulationParamsLoader');
      
      expect(() => {
        loadSimulationParams();
      }).toThrow('Invalid simulation parameters');
    });
  });

  it('handles missing required fields', () => {
    // Override the mock with missing fields
    jest.resetModules();
    jest.mock('../../data/simulationParams.json', () => ({
      // Missing initialInvestment
      systemLifespan: 25,
      maintenanceCost: 200,
      annualDegradation: 0.5,
      energyPriceInflation: 2.5,
      updatedAt: '2024-01-01T00:00:00Z'
    }));
    
    jest.isolateModules(() => {
      const { loadSimulationParams } = require('../../utils/simulationParamsLoader');
      
      expect(() => {
        loadSimulationParams();
      }).toThrow('Invalid simulation parameters');
    });
  });
});