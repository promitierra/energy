import { removeRedundancies, compressJsonData, decompressJsonData, measureCompressionRatio } from '../../utils/jsonOptimizer';

describe('JSON Optimizer Tests', () => {
  describe('removeRedundancies', () => {
    it('should remove null and undefined values', () => {
      const data = {
        name: 'Test',
        value: 100,
        nullValue: null,
        undefinedValue: undefined
      };
      
      const result = removeRedundancies(data);
      
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('value');
      expect(result).not.toHaveProperty('nullValue');
      expect(result).not.toHaveProperty('undefinedValue');
    });
    
    it('should remove empty arrays and objects', () => {
      const data = {
        name: 'Test',
        emptyArray: [],
        nonEmptyArray: [1, 2, 3],
        emptyObject: {},
        nonEmptyObject: { key: 'value' }
      };
      
      const result = removeRedundancies(data);
      
      expect(result).toHaveProperty('name');
      expect(result).not.toHaveProperty('emptyArray');
      expect(result).toHaveProperty('nonEmptyArray');
      expect(result).not.toHaveProperty('emptyObject');
      expect(result).toHaveProperty('nonEmptyObject');
    });
    
    it('should process nested objects recursively', () => {
      const data = {
        name: 'Test',
        nested: {
          value: 100,
          emptyArray: [],
          nullValue: null
        }
      };
      
      const result = removeRedundancies(data);
      
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('nested');
      expect(result.nested).toHaveProperty('value');
      expect(result.nested).not.toHaveProperty('emptyArray');
      expect(result.nested).not.toHaveProperty('nullValue');
    });
    
    it('should process arrays of objects', () => {
      const data = [
        { name: 'Item 1', value: 100, nullValue: null },
        { name: 'Item 2', value: 200, emptyArray: [] }
      ];
      
      const result = removeRedundancies(data);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('value');
      expect(result[0]).not.toHaveProperty('nullValue');
      expect(result[1]).toHaveProperty('name');
      expect(result[1]).toHaveProperty('value');
      expect(result[1]).not.toHaveProperty('emptyArray');
    });
  });
  
  describe('compressJsonData and decompressJsonData', () => {
    it('should compress and decompress object data correctly', () => {
      const originalData = {
        name: 'Test Object',
        values: [1, 2, 3, 4, 5],
        nested: {
          property: 'value',
          number: 42
        }
      };
      
      const compressed = compressJsonData(originalData);
      const decompressed = decompressJsonData(compressed);
      
      expect(decompressed).toEqual(originalData);
    });
    
    it('should compress and decompress array data correctly', () => {
      const originalData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ];
      
      const compressed = compressJsonData(originalData);
      const decompressed = decompressJsonData(compressed);
      
      expect(decompressed).toEqual(originalData);
    });
    
    it('should handle empty data', () => {
      expect(compressJsonData(null)).toBe('null');
      expect(compressJsonData(undefined)).toBe('undefined');
      expect(compressJsonData([])).toBe('');
      
      expect(decompressJsonData('')).toBeNull();
      expect(decompressJsonData('null')).toBeNull();
    });
  });
  
  describe('measureCompressionRatio', () => {
    it('should calculate compression ratio correctly', () => {
      const originalData = {
        id: 1,
        name: 'Test',
        description: 'This is a test object with some data',
        values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        metadata: {
          created: '2024-01-01T00:00:00Z',
          updated: '2024-01-02T00:00:00Z',
          tags: ['test', 'compression', 'json']
        },
        emptyArray: [],
        nullValue: null
      };
      
      const compressed = compressJsonData(originalData);
      const ratio = measureCompressionRatio(originalData, compressed);
      
      // Expect some compression (at least 10%)
      expect(ratio).toBeGreaterThan(10);
      expect(typeof ratio).toBe('number');
    });
    
    it('should handle data that cannot be compressed further', () => {
      const alreadyOptimized = { a: 1 };
      const compressed = compressJsonData(alreadyOptimized);
      const ratio = measureCompressionRatio(alreadyOptimized, compressed);
      
      // Small objects might not compress well
      expect(ratio).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('Performance benchmarking', () => {
    it('should compress large datasets efficiently', () => {
      // Create a large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 1000,
        active: i % 2 === 0,
        tags: [`tag${i % 5}`, `tag${i % 10}`],
        metadata: {
          created: new Date().toISOString(),
          priority: i % 5,
          emptyValue: null
        }
      }));
      
      // Measure compression time
      const startTime = performance.now();
      const compressed = compressJsonData(largeDataset);
      const endTime = performance.now();
      
      const compressionTime = endTime - startTime;
      console.log(`Compression time for 1000 items: ${compressionTime.toFixed(2)}ms`);
      
      // Measure decompression time
      const startDecompressTime = performance.now();
      const decompressed = decompressJsonData(compressed);
      const endDecompressTime = performance.now();
      
      const decompressionTime = endDecompressTime - startDecompressTime;
      console.log(`Decompression time for 1000 items: ${decompressionTime.toFixed(2)}ms`);
      
      // Verify data integrity
      expect(decompressed).toHaveLength(1000);
      expect(decompressed[0]).toHaveProperty('id');
      expect(decompressed[0]).toHaveProperty('name');
      
      // Calculate and log compression ratio
      const ratio = measureCompressionRatio(largeDataset, compressed);
      console.log(`Compression ratio: ${ratio}%`);
      
      // Expect reasonable performance (adjust thresholds as needed)
      expect(compressionTime).toBeLessThan(1000); // Less than 1 second
      expect(decompressionTime).toBeLessThan(1000); // Less than 1 second
      expect(ratio).toBeGreaterThan(0); // Some compression achieved
    });
  });
});