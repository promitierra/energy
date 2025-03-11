import { loadEmissionsData, getEnergySourceByName, getEnergySourcesByType, getConversionFactor } from '../../utils/emissionsLoader';
import { loadTariffs, getTariffByName, getTariffsByType } from '../../utils/tariffLoader';
import { loadSimulationParams } from '../../utils/simulationParamsLoader';
import { EmissionsData } from '../../schemas/emissionsSchema';
import { TariffData } from '../../schemas/tariffSchema';
import { SimulationParams } from '../../schemas/simulationParamsSchema';
import { z } from 'zod';

describe('Cross-Loader Integration Tests', () => {
  let emissionsData: EmissionsData;
  let tariffs: TariffData[];
  let simulationParams: SimulationParams;

  beforeAll(() => {
    // Load all data types
    emissionsData = loadEmissionsData();
    tariffs = loadTariffs();
    simulationParams = loadSimulationParams();
  });

  describe('Data Loading Consistency', () => {
    it('should load all data types successfully in the same test context', () => {
      // Verify all data types are loaded correctly
      expect(emissionsData).toBeDefined();
      expect(tariffs).toBeDefined();
      expect(simulationParams).toBeDefined();
      
      // Verify basic structure of each data type
      expect(emissionsData.energySources).toBeDefined();
      expect(Array.isArray(emissionsData.energySources)).toBe(true);
      expect(Array.isArray(tariffs)).toBe(true);
      expect(simulationParams.initialInvestment).toBeDefined();
    });

    it('should maintain data integrity when loading multiple data sources', () => {
      // Load the data again to ensure consistency
      const emissionsData2 = loadEmissionsData();
      const tariffs2 = loadTariffs();
      const simulationParams2 = loadSimulationParams();
      
      // Verify that the data is the same when loaded multiple times
      expect(emissionsData.energySources.length).toBe(emissionsData2.energySources.length);
      expect(tariffs.length).toBe(tariffs2.length);
      expect(simulationParams.initialInvestment).toBe(simulationParams2.initialInvestment);
    });

    it('should return identical data on repeated calls to the same loader', () => {
      // Multiple calls to the same loader should return identical data
      const firstTariffs = loadTariffs();
      const secondTariffs = loadTariffs();
      const thirdTariffs = loadTariffs();
      
      // Deep equality check
      expect(JSON.stringify(firstTariffs)).toBe(JSON.stringify(secondTariffs));
      expect(JSON.stringify(secondTariffs)).toBe(JSON.stringify(thirdTariffs));
      
      // Same for other loaders
      const firstParams = loadSimulationParams();
      const secondParams = loadSimulationParams();
      expect(JSON.stringify(firstParams)).toBe(JSON.stringify(secondParams));
      
      const firstEmissions = loadEmissionsData();
      const secondEmissions = loadEmissionsData();
      expect(JSON.stringify(firstEmissions)).toBe(JSON.stringify(secondEmissions));
    });

    it('should maintain referential integrity between helper functions and direct loading', () => {
      // Get a tariff by name
      const tariffName = tariffs[0].name;
      const tariffByName = getTariffByName(tariffName);
      
      // The same tariff should be found in the directly loaded array
      const directTariff = tariffs.find(t => t.name === tariffName);
      expect(tariffByName).toEqual(directTariff);
      
      // Same for energy sources
      const sourceType = 'renewable';
      const sourcesByType = getEnergySourcesByType(sourceType);
      const directSources = emissionsData.energySources.filter(s => s.type === sourceType);
      expect(sourcesByType.length).toBe(directSources.length);
      
      // Check each source matches
      sourcesByType.forEach(source => {
        const matchingSource = directSources.find(s => s.name === source.name);
        expect(matchingSource).toEqual(source);
      });
    });
  });

  describe('Cross-Data Integration', () => {
    it('should allow integration of emissions data with simulation parameters', () => {
      // Example: Calculate lifecycle emissions cost using both data sources
      const solarPV = getEnergySourceByName('Solar PV');
      expect(solarPV).toBeDefined();
      
      if (solarPV) {
        // Calculate a simple ROI using both data sources
        const lifecycleEmissionsCost = solarPV.lifecycleEmissions * simulationParams.systemLifespan;
        expect(lifecycleEmissionsCost).toBeGreaterThan(0);
        
        // Verify the calculation uses both data sources correctly
        const manualCalculation = solarPV.lifecycleEmissions * simulationParams.systemLifespan;
        expect(lifecycleEmissionsCost).toBe(manualCalculation);
      }
    });

    it('should allow integration of tariff data with simulation parameters', () => {
      // Get a fixed tariff (adjust name if needed based on your actual data)
      const fixedTariff = tariffs.find(t => t.type === 'fixed');
      expect(fixedTariff).toBeDefined();
      
      if (fixedTariff) {
        // Calculate energy cost over system lifespan
        const annualEnergyCost = fixedTariff.energyPrice * 8760; // kWh price * hours in a year
        const totalEnergyCost = annualEnergyCost * simulationParams.systemLifespan;
        
        // Apply energy price inflation
        let inflatedCost = 0;
        for (let year = 0; year < simulationParams.systemLifespan; year++) {
          const yearlyInflation = Math.pow(1 + simulationParams.energyPriceInflation / 100, year);
          inflatedCost += annualEnergyCost * yearlyInflation;
        }
        
        expect(inflatedCost).toBeGreaterThan(totalEnergyCost);
      }
    });
  });

  describe('Performance with Multiple Loaders', () => {
    it('should load all data types efficiently', () => {
      const startTime = performance.now();
      
      // Load all data types in sequence
      loadEmissionsData();
      loadTariffs();
      loadSimulationParams();
      
      const endTime = performance.now();
      const totalLoadTime = endTime - startTime;
      
      // All three data sources should load in less than 150ms combined
      // This threshold may need adjustment based on the actual performance
      expect(totalLoadTime).toBeLessThan(150);
      console.log(`Total load time for all data sources: ${totalLoadTime}ms`);
    });
    
    it('should measure individual data loading performance', () => {
      // Measure emissions data loading time
      const emissionsStartTime = performance.now();
      loadEmissionsData();
      const emissionsEndTime = performance.now();
      const emissionsLoadTime = emissionsEndTime - emissionsStartTime;
      
      // Measure tariffs data loading time
      const tariffsStartTime = performance.now();
      loadTariffs();
      const tariffsEndTime = performance.now();
      const tariffsLoadTime = tariffsEndTime - tariffsStartTime;
      
      // Measure simulation parameters loading time
      const paramsStartTime = performance.now();
      loadSimulationParams();
      const paramsEndTime = performance.now();
      const paramsLoadTime = paramsEndTime - paramsStartTime;
      
      // Log individual loading times
      console.log(`Emissions data load time: ${emissionsLoadTime}ms`);
      console.log(`Tariffs data load time: ${tariffsLoadTime}ms`);
      console.log(`Simulation parameters load time: ${paramsLoadTime}ms`);
      
      // Verify each loader meets performance expectations
      expect(emissionsLoadTime).toBeLessThan(50);
      expect(tariffsLoadTime).toBeLessThan(50);
      expect(paramsLoadTime).toBeLessThan(50);
    });
  });
  
  describe('Error Handling and Data Validation', () => {
    // Save original console.error
    const originalConsoleError = console.error;
    
    beforeEach(() => {
      // Mock console.error to prevent test output pollution
      console.error = jest.fn();
    });
    
    afterEach(() => {
      // Restore original console.error
      console.error = originalConsoleError;
    });
    
    it('should handle missing energy source gracefully', () => {
      // Try to get a non-existent energy source
      const nonExistentSource = getEnergySourceByName('NonExistentSource');
      expect(nonExistentSource).toBeUndefined();
    });
    
    it('should handle missing tariff gracefully', () => {
      // Try to find a non-existent tariff
      const nonExistentTariff = tariffs.find(t => t.name === 'NonExistentTariff');
      expect(nonExistentTariff).toBeUndefined();
    });
    
    it('should handle non-existent conversion factors gracefully', () => {
      // Try to get a non-existent conversion factor
      const factor = getConversionFactor('invalidUnit', 'anotherInvalidUnit');
      
      // Should return undefined, not throw
      expect(factor).toBeUndefined();
    });
    
    it('should validate data types correctly across loaders', () => {
      // Verify emissions data structure
      expect(typeof emissionsData.energySources[0].name).toBe('string');
      expect(typeof emissionsData.energySources[0].co2PerKWh).toBe('number');
      
      // Verify tariff data structure
      expect(typeof tariffs[0].name).toBe('string');
      expect(typeof tariffs[0].basePrice).toBe('number');
      
      // Verify simulation parameters structure
      expect(typeof simulationParams.initialInvestment).toBe('number');
      expect(typeof simulationParams.systemLifespan).toBe('number');
    });
  });
  
  describe('Complex Cross-Data Calculations', () => {
    it('should calculate emissions cost with tariff pricing', () => {
      // Get a renewable energy source
      const renewableSource = emissionsData.energySources.find(source => source.type === 'renewable');
      expect(renewableSource).toBeDefined();
      
      // Get a fixed tariff
      const fixedTariff = tariffs.find(t => t.type === 'fixed');
      expect(fixedTariff).toBeDefined();
      
      if (renewableSource && fixedTariff) {
        // Calculate annual energy production (simplified example)
        const annualProduction = 5000; // kWh
        
        // Calculate emissions savings compared to fossil fuel
        const fossilSource = emissionsData.energySources.find(source => source.type === 'fossil');
        expect(fossilSource).toBeDefined();
        
        if (fossilSource) {
          // Calculate emissions savings
          const emissionsSavings = (fossilSource.co2PerKWh - renewableSource.co2PerKWh) * annualProduction;
          expect(emissionsSavings).toBeGreaterThan(0);
          
          // Calculate financial savings
          const annualCost = annualProduction * fixedTariff.energyPrice;
          expect(annualCost).toBeGreaterThan(0);
          
          // Calculate ROI considering system lifespan
          const totalSavings = annualCost * simulationParams.systemLifespan;
          const roi = (totalSavings - simulationParams.initialInvestment) / simulationParams.initialInvestment;
          
          // Log the results
          console.log(`Emissions savings: ${emissionsSavings} kg CO2`);
          console.log(`Financial ROI: ${roi * 100}%`);
          
          // Verify calculations are reasonable
          expect(roi).toBeGreaterThan(-1); // ROI could be negative for some scenarios
        }
      }
    });
    
    it('should calculate payback period using all data sources', () => {
      // Get a renewable energy source
      const solarPV = getEnergySourceByName('Solar PV');
      expect(solarPV).toBeDefined();
      
      // Get a fixed tariff
      const fixedTariff = tariffs.find(t => t.type === 'fixed');
      expect(fixedTariff).toBeDefined();
      
      if (solarPV && fixedTariff) {
        // Simplified annual energy production
        const annualProduction = 4000; // kWh
        
        // Calculate annual savings
        const annualSavings = annualProduction * fixedTariff.energyPrice;
        
        // Calculate simple payback period (without considering inflation or degradation)
        const simplePayback = simulationParams.initialInvestment / annualSavings;
        
        // Calculate payback with annual degradation
        let cumulativeSavings = 0;
        let paybackYear = 0;
        
        for (let year = 1; year <= simulationParams.systemLifespan; year++) {
          const yearlyProduction = annualProduction * Math.pow(1 - simulationParams.annualDegradation / 100, year - 1);
          const yearlyInflation = Math.pow(1 + simulationParams.energyPriceInflation / 100, year - 1);
          const yearlyTariff = fixedTariff.energyPrice * yearlyInflation;
          const yearlySavings = yearlyProduction * yearlyTariff;
          
          cumulativeSavings += yearlySavings;
          
          if (cumulativeSavings >= simulationParams.initialInvestment && paybackYear === 0) {
            paybackYear = year;
          }
        }
        
        // Log the results
        console.log(`Simple payback period: ${simplePayback.toFixed(2)} years`);
        console.log(`Payback period with degradation and inflation: ${paybackYear} years`);
        
        // Verify calculations
        expect(paybackYear).toBeGreaterThan(0);
        expect(paybackYear).toBeLessThanOrEqual(simulationParams.systemLifespan);
      }
    });
  });
});