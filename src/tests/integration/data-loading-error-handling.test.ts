import { loadTariffs, getTariffByName } from '../../utils/tariffLoader';
import { loadSimulationParams } from '../../utils/simulationParamsLoader';
import { loadEmissionsData, getEnergySourceByName } from '../../utils/emissionsLoader';
import { TariffData } from '../../schemas/tariffSchema';
import { SimulationParams } from '../../schemas/simulationParamsSchema';
import { EmissionsData } from '../../schemas/emissionsSchema';

describe('Data Loading Error Handling Integration Tests', () => {
  // Mock console.error to prevent test output pollution
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    console.error = jest.fn();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('Graceful Error Handling', () => {
    it('should handle non-existent tariffs gracefully', () => {
      // Test getting a non-existent tariff
      const nonExistentTariff = getTariffByName('NonExistentTariff');
      expect(nonExistentTariff).toBeUndefined();
    });

    it('should handle non-existent energy sources gracefully', () => {
      // Test getting a non-existent energy source
      const nonExistentSource = getEnergySourceByName('NonExistentSource');
      expect(nonExistentSource).toBeUndefined();
    });
  });

  describe('Data Type Safety', () => {
    let tariffs: TariffData[];
    let simulationParams: SimulationParams;
    let emissionsData: EmissionsData;

    beforeAll(() => {
      // Load all data types
      tariffs = loadTariffs();
      simulationParams = loadSimulationParams();
      emissionsData = loadEmissionsData();
    });

    it('should ensure tariff data has correct types', () => {
      // Verify that all tariffs have the correct data types
      tariffs.forEach(tariff => {
        expect(typeof tariff.name).toBe('string');
        expect(['fixed', 'variable']).toContain(tariff.type);
        expect(typeof tariff.basePrice).toBe('number');
        expect(typeof tariff.energyPrice).toBe('number');
        
        if (tariff.powerPrice !== undefined) {
          expect(typeof tariff.powerPrice).toBe('number');
        }
        
        if (tariff.timeRanges) {
          expect(Array.isArray(tariff.timeRanges)).toBe(true);
          tariff.timeRanges.forEach(range => {
            expect(typeof range.startHour).toBe('number');
            expect(typeof range.endHour).toBe('number');
            expect(typeof range.multiplier).toBe('number');
          });
        }
      });
    });

    it('should ensure simulation parameters have correct types', () => {
      // Verify that simulation parameters have the correct data types
      expect(typeof simulationParams.initialInvestment).toBe('number');
      expect(Number.isInteger(simulationParams.systemLifespan)).toBe(true);
      expect(typeof simulationParams.maintenanceCost).toBe('number');
      expect(typeof simulationParams.annualDegradation).toBe('number');
      expect(typeof simulationParams.energyPriceInflation).toBe('number');
      
      if (simulationParams.incentives) {
        expect(Array.isArray(simulationParams.incentives)).toBe(true);
        simulationParams.incentives.forEach(incentive => {
          expect(typeof incentive.name).toBe('string');
          expect(['rebate', 'taxCredit', 'grant']).toContain(incentive.type);
          expect(typeof incentive.amount).toBe('number');
          
          if (incentive.maxLimit !== undefined) {
            expect(typeof incentive.maxLimit).toBe('number');
          }
          
          if (incentive.expirationDate !== undefined) {
            expect(typeof incentive.expirationDate).toBe('string');
            // Verify it's a valid date string
            expect(() => new Date(incentive.expirationDate!)).not.toThrow();
          }
        });
      }
    });

    it('should ensure emissions data has correct types', () => {
      // Verify that emissions data has the correct data types
      expect(Array.isArray(emissionsData.energySources)).toBe(true);
      emissionsData.energySources.forEach(source => {
        expect(typeof source.name).toBe('string');
        expect(['renewable', 'fossil', 'nuclear', 'hybrid']).toContain(source.type);
        expect(typeof source.co2PerKWh).toBe('number');
        expect(typeof source.lifecycleEmissions).toBe('number');
        expect(typeof source.conversionEfficiency).toBe('number');
        expect(typeof source.updatedAt).toBe('string');
      });
      
      expect(Array.isArray(emissionsData.conversionFactors)).toBe(true);
      emissionsData.conversionFactors.forEach(factor => {
        expect(typeof factor.fromUnit).toBe('string');
        expect(typeof factor.toUnit).toBe('string');
        expect(typeof factor.factor).toBe('number');
        
        if (factor.context !== undefined) {
          expect(['energy', 'emissions', 'power']).toContain(factor.context);
        }
        
        if (factor.notes !== undefined) {
          expect(typeof factor.notes).toBe('string');
        }
      });
    });
  });

  describe('Value Range Validation', () => {
    let tariffs: TariffData[];
    let simulationParams: SimulationParams;
    let emissionsData: EmissionsData;

    beforeAll(() => {
      // Load all data types
      tariffs = loadTariffs();
      simulationParams = loadSimulationParams();
      emissionsData = loadEmissionsData();
    });

    it('should ensure tariff prices are positive', () => {
      // Verify that all tariff prices are positive
      tariffs.forEach(tariff => {
        expect(tariff.basePrice).toBeGreaterThan(0);
        expect(tariff.energyPrice).toBeGreaterThan(0);
        
        if (tariff.powerPrice !== undefined) {
          expect(tariff.powerPrice).toBeGreaterThan(0);
        }
        
        if (tariff.timeRanges) {
          tariff.timeRanges.forEach(range => {
            expect(range.multiplier).toBeGreaterThan(0);
            expect(range.startHour).toBeGreaterThanOrEqual(0);
            expect(range.startHour).toBeLessThanOrEqual(23);
            expect(range.endHour).toBeGreaterThanOrEqual(0);
            expect(range.endHour).toBeLessThanOrEqual(23);
          });
        }
      });
    });

    it('should ensure simulation parameters are within valid ranges', () => {
      // Verify that simulation parameters are within valid ranges
      expect(simulationParams.initialInvestment).toBeGreaterThan(0);
      expect(simulationParams.systemLifespan).toBeGreaterThan(0);
      expect(simulationParams.maintenanceCost).toBeGreaterThanOrEqual(0);
      expect(simulationParams.annualDegradation).toBeGreaterThanOrEqual(0);
      expect(simulationParams.annualDegradation).toBeLessThanOrEqual(100);
      expect(simulationParams.energyPriceInflation).toBeGreaterThanOrEqual(-100);
      expect(simulationParams.energyPriceInflation).toBeLessThanOrEqual(100);
      
      if (simulationParams.financingRate !== undefined) {
        expect(simulationParams.financingRate).toBeGreaterThanOrEqual(0);
        expect(simulationParams.financingRate).toBeLessThanOrEqual(100);
      }
      
      if (simulationParams.taxRate !== undefined) {
        expect(simulationParams.taxRate).toBeGreaterThanOrEqual(0);
        expect(simulationParams.taxRate).toBeLessThanOrEqual(100);
      }
      
      if (simulationParams.incentives) {
        simulationParams.incentives.forEach(incentive => {
          expect(incentive.amount).toBeGreaterThan(0);
          
          if (incentive.maxLimit !== undefined) {
            expect(incentive.maxLimit).toBeGreaterThan(0);
          }
        });
      }
    });

    it('should ensure emissions data values are within valid ranges', () => {
      // Verify that emissions data values are within valid ranges
      emissionsData.energySources.forEach(source => {
        expect(source.co2PerKWh).toBeGreaterThanOrEqual(0);
        expect(source.lifecycleEmissions).toBeGreaterThanOrEqual(0);
        expect(source.conversionEfficiency).toBeGreaterThanOrEqual(0);
        expect(source.conversionEfficiency).toBeLessThanOrEqual(100);
      });
      
      emissionsData.conversionFactors.forEach(factor => {
        expect(factor.factor).toBeGreaterThan(0);
      });
    });
  });

  describe('Date Format Validation', () => {
    let tariffs: TariffData[];
    let simulationParams: SimulationParams;
    let emissionsData: EmissionsData;

    beforeAll(() => {
      // Load all data types
      tariffs = loadTariffs();
      simulationParams = loadSimulationParams();
      emissionsData = loadEmissionsData();
    });

    it('should ensure all date strings are valid ISO format', () => {
      // ISO date format regex
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      
      // Verify tariff dates
      tariffs.forEach(tariff => {
        expect(tariff.updatedAt).toMatch(dateRegex);
        expect(() => new Date(tariff.updatedAt)).not.toThrow();
      });
      
      // Verify simulation parameters date
      expect(simulationParams.updatedAt).toMatch(dateRegex);
      expect(() => new Date(simulationParams.updatedAt)).not.toThrow();
      
      if (simulationParams.incentives) {
        simulationParams.incentives.forEach(incentive => {
          if (incentive.expirationDate) {
            expect(incentive.expirationDate).toMatch(dateRegex);
            expect(() => new Date(incentive.expirationDate!)).not.toThrow();
          }
        });
      }
      
      // Verify emissions data dates
      emissionsData.energySources.forEach(source => {
        expect(source.updatedAt).toMatch(dateRegex);
        expect(() => new Date(source.updatedAt)).not.toThrow();
      });
    });
  });
});