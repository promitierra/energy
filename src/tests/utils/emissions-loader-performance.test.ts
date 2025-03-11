import { loadEmissionsData, getEnergySourceByName } from '../../utils/emissionsLoader';
import { EmissionsData } from '../../schemas/emissionsSchema';

describe('Emissions Loader Performance Tests', () => {
  let emissionsData: EmissionsData;

  beforeAll(() => {
    // Load emissions data once for all tests
    emissionsData = loadEmissionsData();
  });

  it('should load emissions data within acceptable time', () => {
    // Measure loading time
    const startTime = performance.now();
    const data = loadEmissionsData();
    const endTime = performance.now();
    
    const loadTime = endTime - startTime;
    console.log(`Emissions data load time: ${loadTime}ms`);
    
    // Ensure loading time is under threshold (e.g., 50ms)
    expect(loadTime).toBeLessThan(50);
    
    // Verify data was loaded correctly
    expect(data).toBeDefined();
    expect(data.energySources).toBeDefined();
    expect(Array.isArray(data.energySources)).toBe(true);
    expect(data.energySources.length).toBeGreaterThan(0);
  });

  it('should retrieve energy source by name efficiently', () => {
    // Measure retrieval time
    const startTime = performance.now();
    const solarPV = getEnergySourceByName('Solar PV');
    const endTime = performance.now();
    
    const retrievalTime = endTime - startTime;
    console.log(`Energy source retrieval time: ${retrievalTime}ms`);
    
    // Ensure retrieval time is under threshold (e.g., 5ms)
    expect(retrievalTime).toBeLessThan(5);
    
    // Verify correct data was retrieved
    expect(solarPV).toBeDefined();
    expect(solarPV?.name).toBe('Solar PV');
    expect(solarPV?.type).toBe('renewable');
  });

  it('should handle multiple consecutive loads efficiently', () => {
    const iterations = 10;
    const startTime = performance.now();
    
    // Perform multiple consecutive loads
    for (let i = 0; i < iterations; i++) {
      const data = loadEmissionsData();
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
    const firstData = loadEmissionsData();
    const firstEndTime = performance.now();
    const firstLoadTime = firstEndTime - firstStartTime;
    
    // Second access
    const secondStartTime = performance.now();
    const secondData = loadEmissionsData();
    const secondEndTime = performance.now();
    const secondLoadTime = secondEndTime - secondStartTime;
    
    console.log(`First load time: ${firstLoadTime}ms`);
    console.log(`Second load time: ${secondLoadTime}ms`);
    
    // Verify data consistency
    expect(firstData.energySources.length).toBe(secondData.energySources.length);
    
    // Second load should be similar or faster than first load
    // Allow for some variation due to system factors
    const maxVariation = 1.5; // 50% variation allowed
    expect(secondLoadTime).toBeLessThanOrEqual(firstLoadTime * maxVariation);
  });
});