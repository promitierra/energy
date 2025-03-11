import { loadEmissionsData, getEnergySourceByName, getConversionFactor } from '../../utils/emissionsLoader';
import { EmissionsData } from '../../schemas/emissionsSchema';
import emissionsData from '../../data/emissions.json';

describe('Emissions Data Persistence Integration', () => {
  let loadedData: EmissionsData;

  beforeAll(() => {
    // Load the actual data from the JSON file
    loadedData = loadEmissionsData();
  });

  describe('Data Structure Integrity', () => {
    it('should load the correct structure from JSON file', () => {
      expect(loadedData).toHaveProperty('energySources');
      expect(loadedData).toHaveProperty('conversionFactors');
      expect(Array.isArray(loadedData.energySources)).toBe(true);
      expect(Array.isArray(loadedData.conversionFactors)).toBe(true);
    });

    it('should have the same number of energy sources as the source JSON', () => {
      expect(loadedData.energySources.length).toBe(emissionsData.energySources.length);
    });

    it('should have the same number of conversion factors as the source JSON', () => {
      expect(loadedData.conversionFactors.length).toBe(emissionsData.conversionFactors.length);
    });
  });

  describe('Data Content Validation', () => {
    it('should correctly load specific energy sources', () => {
      // Test a few specific energy sources
      const solarPV = getEnergySourceByName('Solar PV');
      expect(solarPV).toBeDefined();
      expect(solarPV?.type).toBe('renewable');
      expect(solarPV?.co2PerKWh).toBe(41);

      const naturalGas = getEnergySourceByName('Natural Gas');
      expect(naturalGas).toBeDefined();
      expect(naturalGas?.type).toBe('fossil');
      expect(naturalGas?.co2PerKWh).toBe(490);
    });

    it('should correctly load specific conversion factors', () => {
      // Test a few specific conversion factors
      const kwhToMwh = getConversionFactor('kWh', 'MWh');
      expect(kwhToMwh).toBeDefined();
      expect(kwhToMwh?.factor).toBe(0.001);
      expect(kwhToMwh?.context).toBe('energy');

      const gco2ToKgco2 = getConversionFactor('gCO2', 'kgCO2');
      expect(gco2ToKgco2).toBeDefined();
      expect(gco2ToKgco2?.factor).toBe(0.001);
      expect(gco2ToKgco2?.context).toBe('emissions');
    });
  });

  describe('Data Performance', () => {
    it('should load emissions data efficiently', () => {
      const startTime = performance.now();
      loadEmissionsData();
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // The data should load in less than 50ms
      // This threshold may need adjustment based on the actual performance
      expect(loadTime).toBeLessThan(50);
    });
  });
});