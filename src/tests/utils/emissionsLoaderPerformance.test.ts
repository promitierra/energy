import { loadEmissionsData } from '../../utils/emissionsLoader';
import { EmissionsData } from '../../schemas/emissionsSchema';

describe('Emissions Data Loading Performance Tests', () => {
  // Store test results for comparison
  let loadTime: number;
  let loadedData: EmissionsData;

  // Performance thresholds
  const MAX_LOAD_TIME_MS = 100; // Maximum acceptable load time in milliseconds

  beforeAll(() => {
    // Measure the time it takes to load the emissions data
    const startTime = performance.now();
    loadedData = loadEmissionsData();
    const endTime = performance.now();
    loadTime = endTime - startTime;
  });

  describe('Load Time Performance', () => {
    it('should load emissions data within acceptable time limit', () => {
      console.log(`Emissions data loaded in ${loadTime.toFixed(2)}ms`);
      expect(loadTime).toBeLessThan(MAX_LOAD_TIME_MS);
    });

    it('should load all energy sources efficiently', () => {
      expect(loadedData.energySources.length).toBeGreaterThan(0);
      // Additional check to ensure we're not just testing an empty array
      expect(loadedData.energySources.length).toBeGreaterThanOrEqual(5);
    });

    it('should load all conversion factors efficiently', () => {
      expect(loadedData.conversionFactors.length).toBeGreaterThan(0);
      // Additional check to ensure we're not just testing an empty array
      expect(loadedData.conversionFactors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Memory Usage', () => {
    it('should have reasonable object size', () => {
      // Rough estimation of object size by converting to JSON string
      const dataSize = JSON.stringify(loadedData).length;
      console.log(`Emissions data size: ${dataSize} bytes`);
      
      // Set a reasonable maximum size based on expected data volume
      const MAX_SIZE_BYTES = 100000; // 100KB
      expect(dataSize).toBeLessThan(MAX_SIZE_BYTES);
    });
  });

  describe('Repeated Loading Performance', () => {
    it('should maintain consistent performance on repeated loads', () => {
      const loadTimes: number[] = [];
      
      // Perform multiple loads to check consistency
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        loadEmissionsData();
        const endTime = performance.now();
        loadTimes.push(endTime - startTime);
      }
      
      // Calculate average and standard deviation
      const avgTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
      const variance = loadTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / loadTimes.length;
      const stdDev = Math.sqrt(variance);
      
      console.log(`Average load time: ${avgTime.toFixed(2)}ms, StdDev: ${stdDev.toFixed(2)}ms`);
      
      // Standard deviation should be less than 50% of average time for consistency
      expect(stdDev).toBeLessThan(avgTime * 0.5);
    });
  });
});