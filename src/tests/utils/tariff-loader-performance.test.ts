import { loadTariffs, getTariffByName } from '../../utils/tariffLoader';
import { TariffData } from '../../schemas/tariffSchema';

describe('Tariff Loader Performance Tests', () => {
  let tariffs: TariffData[];

  beforeAll(() => {
    // Load tariff data once for all tests
    tariffs = loadTariffs();
  });

  it('should load tariff data within acceptable time', () => {
    // Measure loading time
    const startTime = performance.now();
    const data = loadTariffs();
    const endTime = performance.now();
    
    const loadTime = endTime - startTime;
    console.log(`Tariff data load time: ${loadTime}ms`);
    
    // Ensure loading time is under threshold (e.g., 50ms)
    expect(loadTime).toBeLessThan(50);
    
    // Verify data was loaded correctly
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should retrieve tariff by name efficiently', () => {
    // Measure retrieval time
    const startTime = performance.now();
    const fixedTariff = tariffs.find(t => t.name === 'Tarifa Base');
    const endTime = performance.now();
    
    const retrievalTime = endTime - startTime;
    console.log(`Tariff retrieval time: ${retrievalTime}ms`);
    
    // Ensure retrieval time is under threshold (e.g., 5ms)
    expect(retrievalTime).toBeLessThan(5);
    
    // Verify correct data was retrieved
    expect(fixedTariff).toBeDefined();
    expect(fixedTariff?.type).toBe('fixed');
  });

  it('should handle multiple consecutive loads efficiently', () => {
    const iterations = 10;
    const startTime = performance.now();
    
    // Perform multiple consecutive loads
    for (let i = 0; i < iterations; i++) {
      const data = loadTariffs();
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
    const firstData = loadTariffs();
    const firstEndTime = performance.now();
    const firstLoadTime = firstEndTime - firstStartTime;
    
    // Second access
    const secondStartTime = performance.now();
    const secondData = loadTariffs();
    const secondEndTime = performance.now();
    const secondLoadTime = secondEndTime - secondStartTime;
    
    console.log(`First load time: ${firstLoadTime}ms`);
    console.log(`Second load time: ${secondLoadTime}ms`);
    
    // Verify data consistency
    expect(firstData.length).toBe(secondData.length);
    
    // Second load should be similar or faster than first load
    // Allow for some variation due to system factors
    const maxVariation = 1.5; // 50% variation allowed
    expect(secondLoadTime).toBeLessThanOrEqual(firstLoadTime * maxVariation);
  });

  it('should filter tariffs by type efficiently', () => {
    const startTime = performance.now();
    
    // Filter tariffs by type
    const fixedTariffs = tariffs.filter(t => t.type === 'fixed');
    const variableTariffs = tariffs.filter(t => t.type === 'variable');
    
    const endTime = performance.now();
    const filterTime = endTime - startTime;
    
    console.log(`Tariff filtering time: ${filterTime}ms`);
    console.log(`Fixed tariffs: ${fixedTariffs.length}, Variable tariffs: ${variableTariffs.length}`);
    
    // Ensure filtering time is under threshold
    expect(filterTime).toBeLessThan(5);
    
    // Verify filtered data
    expect(fixedTariffs.every(t => t.type === 'fixed')).toBe(true);
    expect(variableTariffs.every(t => t.type === 'variable')).toBe(true);
    expect(fixedTariffs.length + variableTariffs.length).toBe(tariffs.length);
  });
});