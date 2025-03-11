import { loadTariffs, getTariffByName, getTariffsByType } from '../../utils/tariffLoader';
import { TariffData } from '../../schemas/tariffSchema';
import tariffData from '../../data/tariffs.json';

describe('Tariff Data Persistence Integration', () => {
  let loadedData: TariffData[];

  beforeAll(() => {
    // Load the actual data from the JSON file
    loadedData = loadTariffs();
  });

  describe('Data Structure Integrity', () => {
    it('should load the correct structure from JSON file', () => {
      expect(Array.isArray(loadedData)).toBe(true);
      expect(loadedData.length).toBeGreaterThan(0);
      
      // Check structure of first tariff
      const firstTariff = loadedData[0];
      expect(firstTariff).toHaveProperty('name');
      expect(firstTariff).toHaveProperty('type');
      expect(firstTariff).toHaveProperty('basePrice');
      expect(firstTariff).toHaveProperty('energyPrice');
    });

    it('should have the same number of tariffs as the source JSON', () => {
      expect(loadedData.length).toBe(tariffData.tariffs.length);
    });
  });

  describe('Data Content Validation', () => {
    it('should correctly load specific fixed tariffs', () => {
      // Test a specific fixed tariff
      const tarifaBase = getTariffByName('Tarifa Base');
      expect(tarifaBase).toBeDefined();
      expect(tarifaBase?.type).toBe('fixed');
      expect(tarifaBase?.basePrice).toBe(3.45);
      expect(tarifaBase?.energyPrice).toBe(0.14);
      
      const tarifaIndustrial = getTariffByName('Tarifa Industrial');
      expect(tarifaIndustrial).toBeDefined();
      expect(tarifaIndustrial?.type).toBe('fixed');
      expect(tarifaIndustrial?.basePrice).toBe(6.75);
      expect(tarifaIndustrial?.energyPrice).toBe(0.10);
    });

    it('should correctly load specific variable tariffs with time ranges', () => {
      // Test a specific variable tariff
      const tarifaVariable = getTariffByName('Tarifa Variable');
      expect(tarifaVariable).toBeDefined();
      expect(tarifaVariable?.type).toBe('variable');
      expect(tarifaVariable?.timeRanges).toBeDefined();
      expect(tarifaVariable?.timeRanges?.length).toBe(3);
      
      // Check specific time range
      const nightTimeRange = tarifaVariable?.timeRanges?.[0];
      expect(nightTimeRange).toBeDefined();
      expect(nightTimeRange?.startHour).toBe(0);
      expect(nightTimeRange?.endHour).toBe(7);
      expect(nightTimeRange?.multiplier).toBe(0.8);
    });
  });

  describe('Tariff Filtering', () => {
    it('should correctly filter tariffs by type', () => {
      const fixedTariffs = getTariffsByType('fixed');
      expect(fixedTariffs.length).toBeGreaterThan(0);
      fixedTariffs.forEach(tariff => {
        expect(tariff.type).toBe('fixed');
      });
      
      const variableTariffs = getTariffsByType('variable');
      expect(variableTariffs.length).toBeGreaterThan(0);
      variableTariffs.forEach(tariff => {
        expect(tariff.type).toBe('variable');
        expect(tariff.timeRanges).toBeDefined();
        expect(Array.isArray(tariff.timeRanges)).toBe(true);
      });
    });
  });

  describe('Data Performance', () => {
    it('should load tariff data efficiently', () => {
      const startTime = performance.now();
      loadTariffs();
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // The data should load in less than 50ms
      // This threshold may need adjustment based on the actual performance
      expect(loadTime).toBeLessThan(50);
    });
  });
});