import { loadSimulationParams } from '../../utils/simulationParamsLoader';
import { SimulationParams } from '../../schemas/simulationParamsSchema';

describe('Simulation Parameters Loader Performance Tests', () => {
  let simulationParams: SimulationParams;

  beforeAll(() => {
    // Load simulation parameters once for all tests
    simulationParams = loadSimulationParams();
  });

  it('should load simulation parameters within acceptable time', () => {
    // Measure loading time
    const startTime = performance.now();
    const data = loadSimulationParams();
    const endTime = performance.now();
    
    const loadTime = endTime - startTime;
    console.log(`Simulation parameters load time: ${loadTime}ms`);
    
    // Ensure loading time is under threshold (e.g., 50ms)
    expect(loadTime).toBeLessThan(50);
    
    // Verify data was loaded correctly
    expect(data).toBeDefined();
    expect(data.initialInvestment).toBeDefined();
    expect(data.systemLifespan).toBeDefined();
  });

  it('should handle multiple consecutive loads efficiently', () => {
    const iterations = 10;
    const startTime = performance.now();
    
    // Perform multiple consecutive loads
    for (let i = 0; i < iterations; i++) {
      const data = loadSimulationParams();
      expect(data).toBeDefined();
    }
    
    const endTime = performance.now();
    const averageLoadTime = (endTime - startTime) / iterations;
    
    console.log(`Average load time over ${iterations} iterations: ${averageLoadTime}ms`);
    
    // Ensure average loading time is under threshold
    expect(averageLoadTime).toBeLessThan(50);
  });

  it('should maintain consistent performance with repeated access', () => {
    // First access
    const firstStartTime = performance.now();
    const firstData = loadSimulationParams();
    const firstEndTime = performance.now();
    const firstLoadTime = firstEndTime - firstStartTime;
    
    // Second access
    const secondStartTime = performance.now();
    const secondData = loadSimulationParams();
    const secondEndTime = performance.now();
    const secondLoadTime = secondEndTime - secondStartTime;
    
    console.log(`First load time: ${firstLoadTime}ms`);
    console.log(`Second load time: ${secondLoadTime}ms`);
    
    // Verify data consistency
    expect(firstData.initialInvestment).toBe(secondData.initialInvestment);
    expect(firstData.systemLifespan).toBe(secondData.systemLifespan);
    
    // Second load should be similar or faster than first load
    // Allow for some variation due to system factors
    const maxVariation = 1.5; // 50% variation allowed
    expect(secondLoadTime).toBeLessThanOrEqual(firstLoadTime * maxVariation);
  });

  it('should access simulation parameters properties efficiently', () => {
    const startTime = performance.now();
    
    // Access various properties
    const initialInvestment = simulationParams.initialInvestment;
    const systemLifespan = simulationParams.systemLifespan;
    const maintenanceCost = simulationParams.maintenanceCost;
    const annualDegradation = simulationParams.annualDegradation;
    const energyPriceInflation = simulationParams.energyPriceInflation;
    
    const endTime = performance.now();
    const accessTime = endTime - startTime;
    
    console.log(`Parameter access time: ${accessTime}ms`);
    
    // Ensure access time is under threshold
    expect(accessTime).toBeLessThan(5);
    
    // Verify accessed data
    expect(initialInvestment).toBeGreaterThan(0);
    expect(systemLifespan).toBeGreaterThan(0);
    expect(maintenanceCost).toBeGreaterThanOrEqual(0);
    expect(annualDegradation).toBeGreaterThanOrEqual(0);
    expect(energyPriceInflation).toBeDefined();
  });
});