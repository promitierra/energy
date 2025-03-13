import {
  calculateDeviation,
  filterOutliers,
  normalizeWeatherConditions,
  compareWithPredictions,
  generateSampleInstallationData
} from '../../../features/validation/validationUtils';

// Helper function to calculate production impact from temperature
const productionImpactFromTemperature = (temperature: number): number => {
  // Standard temperature coefficient for solar panels is around -0.4% per degree above 25°C
  return temperature > 25 ? 1 - (temperature - 25) * 0.004 : 1;
};
import { optimizeParameters, defaultParameters } from '../../../features/validation/parameterAdjustment';
import { InstallationData, ValidationSettings, ReadingData } from '../../../features/validation/types';

describe('Comprehensive Synthetic Data Testing for Validation', () => {
  let sampleInstallation: InstallationData;
  
  beforeEach(() => {
    // Generate fresh sample data for each test
    sampleInstallation = generateSampleInstallationData();
  });
  
  describe('Seasonal Pattern Tests', () => {
    test('should correctly identify and adjust for winter consumption patterns', () => {
      // Create a modified sample with specific winter patterns
      const winterReadings: ReadingData[] = [];
      const summerReadings: ReadingData[] = [];
      
      // Generate winter data (December, January, February)
      for (let day = 1; day <= 30; day++) {
        // Winter data - higher consumption, lower production
        const winterDate = new Date(2023, 0, day); // January
        winterReadings.push({
          timestamp: winterDate.toISOString(),
          period: 'daily',
          consumption: 15 + Math.random() * 5, // Higher winter consumption: 15-20 kWh
          production: 3 + Math.random() * 2, // Lower winter production: 3-5 kWh
          weatherConditions: {
            temperature: 5 + Math.random() * 5, // 5-10°C
            irradiance: 300 + Math.random() * 200, // 300-500 W/m²
            cloudCover: 50 + Math.random() * 40 // 50-90%
          }
        });
        
        // Summer data - lower consumption, higher production (adaptado para Colombia)
        const summerDate = new Date(2023, 6, day); // July
        summerReadings.push({
          timestamp: summerDate.toISOString(),
          period: 'daily',
          consumption: 8 + Math.random() * 4, // Lower summer consumption: 8-12 kWh
          production: 10 + Math.random() * 5, // Higher summer production: 10-15 kWh (mayor en Colombia)
          weatherConditions: {
            temperature: 28 + Math.random() * 8, // 28-36°C (más cálido en Colombia)
            irradiance: 800 + Math.random() * 300, // 800-1100 W/m² (mayor irradiancia en Colombia)
            cloudCover: 10 + Math.random() * 30 // 10-40%
          }
        });
      }
      
      // Create test installation with seasonal readings
      const seasonalInstallation: InstallationData = {
        ...sampleInstallation,
        readings: [...winterReadings, ...summerReadings]
      };
      
      // Create predicted data with systematic seasonal bias
      // Underestimate winter consumption by 15%
      // Overestimate summer consumption by 10%
      const predictedData = {
        consumption: seasonalInstallation.readings.map(r => {
          const date = new Date(r.timestamp);
          const month = date.getMonth();
          
          // Winter months (Dec-Feb)
          if ([11, 0, 1].includes(month)) {
            return r.consumption * 0.85; // 15% underestimation
          }
          // Summer months (Jun-Aug)
          else if ([5, 6, 7].includes(month)) {
            return r.consumption * 1.1; // 10% overestimation
          }
          // Other months
          else {
            return r.consumption * (0.95 + Math.random() * 0.1); // ±5% random variation
          }
        }),
        production: seasonalInstallation.readings.map(r => {
          const date = new Date(r.timestamp);
          const month = date.getMonth();
          
          // Winter months (Dec-Feb)
          if ([11, 0, 1].includes(month)) {
            return r.production! * 1.2; // 20% overestimation
          }
          // Summer months (Jun-Aug)
          else if ([5, 6, 7].includes(month)) {
            return r.production! * 0.9; // 10% underestimation
          }
          // Other months
          else {
            return r.production! * (0.95 + Math.random() * 0.1); // ±5% random variation
          }
        }),
        timestamps: seasonalInstallation.readings.map(r => r.timestamp)
      };
      
      // Run comparison
      const comparisonResult = compareWithPredictions(
        seasonalInstallation,
        predictedData,
        {
          comparisonPeriod: 'daily',
          metrics: ['consumption', 'production'],
          normalizeWeather: true,
          excludeOutliers: true
        }
      );
      
      // Optimize parameters
      const optimizedParams = optimizeParameters(
        [seasonalInstallation],
        [predictedData],
        {
          optimizeFor: ['consumption', 'production'],
          constraints: {
            maxIterations: 10,
            convergenceThreshold: 0.1,
            maxAdjustmentPerIteration: 0.05
          }
        }
      );
      
      // Verify that seasonal parameters were adjusted correctly
      expect(optimizedParams.winterConsumptionFactor).toBeGreaterThan(defaultParameters.winterConsumptionFactor);
      expect(optimizedParams.summerConsumptionFactor).toBeLessThan(defaultParameters.summerConsumptionFactor);
      expect(optimizedParams.winterProductionFactor).toBeLessThan(defaultParameters.winterProductionFactor);
      expect(optimizedParams.summerProductionFactor).toBeGreaterThan(defaultParameters.summerProductionFactor);
    });
  });
  
  describe('Weather Impact Tests', () => {
    test('should correctly identify and adjust for temperature impacts on production', () => {
      // Create a modified sample with temperature-dependent production
      const temperatureReadings: ReadingData[] = [];
      
      // Generate data with varying temperatures
      for (let day = 1; day <= 60; day++) {
        const date = new Date(2023, 3, day); // Starting from April
        
        // Alternate between cool, moderate, and hot days
        let temperature: number;
        let productionImpact: number;
        
        if (day % 3 === 0) {
          // Cool day
          temperature = 10 + Math.random() * 5; // 10-15°C
          productionImpact = 1.05; // 5% better than expected
        } else if (day % 3 === 1) {
          // Moderate day
          temperature = 20 + Math.random() * 5; // 20-25°C
          productionImpact = 1.0; // As expected
        } else {
          // Hot day
          temperature = 30 + Math.random() * 10; // 30-40°C
          productionImpact = 0.85; // 15% worse than expected
        }
        
        // Base production value
        const baseProduction = 8 + Math.random() * 4; // 8-12 kWh
        
        temperatureReadings.push({
          timestamp: date.toISOString(),
          period: 'daily',
          consumption: 10 + Math.random() * 5, // 10-15 kWh
          production: baseProduction * productionImpact,
          weatherConditions: {
            temperature,
            irradiance: 600 + Math.random() * 400, // 600-1000 W/m²
            cloudCover: 10 + Math.random() * 50 // 10-60%
          }
        });
      }
      
      // Create test installation with temperature-dependent readings
      const temperatureInstallation: InstallationData = {
        ...sampleInstallation,
        readings: temperatureReadings
      };
      
      // Create predicted data that doesn't account for temperature impact correctly
      const predictedData = {
        consumption: temperatureInstallation.readings.map(r => r.consumption),
        production: temperatureInstallation.readings.map(r => {
          // Underestimate temperature impact
          const temp = r.weatherConditions?.temperature || 25;
          // Use a weaker temperature coefficient than reality
          const tempImpact = 1 - Math.max(0, (temp - 25) * 0.002); // Using 0.2% per degree instead of 0.4%
          return r.production! / productionImpactFromTemperature(temp) * tempImpact;
        }),
        timestamps: temperatureInstallation.readings.map(r => r.timestamp)
      };
      
      // Run comparison
      const comparisonResult = compareWithPredictions(
        temperatureInstallation,
        predictedData,
        {
          comparisonPeriod: 'daily',
          metrics: ['production'],
          normalizeWeather: false, // Don't normalize to test the parameter adjustment
          excludeOutliers: true
        }
      );
      
      // Optimize parameters
      const optimizedParams = optimizeParameters(
        [temperatureInstallation],
        [predictedData],
        {
          optimizeFor: ['production'],
          constraints: {
            maxIterations: 10,
            convergenceThreshold: 0.1,
            maxAdjustmentPerIteration: 0.05
          }
        }
      );
      
      // Verify that temperature coefficient was adjusted correctly
      // Should be more negative to account for stronger temperature impact
      expect(Math.abs(optimizedParams.temperatureCoefficient)).toBeGreaterThan(
        Math.abs(defaultParameters.temperatureCoefficient)
      );
    });
    
    test('should correctly identify and adjust for irradiance impacts on production', () => {
      // Create a modified sample with irradiance-dependent production
      const irradianceReadings: ReadingData[] = [];
      
      // Generate data with varying irradiance levels
      for (let day = 1; day <= 60; day++) {
        const date = new Date(2023, 3, day); // Starting from April
        
        // Alternate between low, medium, and high irradiance days
        let irradiance: number;
        let productionImpact: number;
        
        if (day % 3 === 0) {
          // Low irradiance
          irradiance = 200 + Math.random() * 200; // 200-400 W/m²
          productionImpact = 0.4; // 40% of optimal
        } else if (day % 3 === 1) {
          // Medium irradiance
          irradiance = 500 + Math.random() * 200; // 500-700 W/m²
          productionImpact = 0.7; // 70% of optimal
        } else {
          // High irradiance
          irradiance = 800 + Math.random() * 200; // 800-1000 W/m²
          productionImpact = 1.0; // 100% of optimal
        }
        
        // Base production value
        const baseProduction = 10; // 10 kWh at optimal conditions
        
        irradianceReadings.push({
          timestamp: date.toISOString(),
          period: 'daily',
          consumption: 10 + Math.random() * 5, // 10-15 kWh
          production: baseProduction * productionImpact,
          weatherConditions: {
            temperature: 25, // Constant temperature
            irradiance,
            cloudCover: 10 + Math.random() * 20 // 10-30%
          }
        });
      }
      
      // Create test installation with irradiance-dependent readings
      const irradianceInstallation: InstallationData = {
        ...sampleInstallation,
        readings: irradianceReadings
      };
      
      // Create predicted data that doesn't account for irradiance impact correctly
      const predictedData = {
        consumption: irradianceInstallation.readings.map(r => r.consumption),
        production: irradianceInstallation.readings.map(r => {
          // Underestimate irradiance impact
          const irr = r.weatherConditions?.irradiance || 1000;
          // Use a weaker irradiance factor than reality
          const irrImpact = Math.pow(irr / 1000, 0.8); // Using power of 0.8 instead of linear
          return 10 * irrImpact; // Predicted based on simplified model
        }),
        timestamps: irradianceInstallation.readings.map(r => r.timestamp)
      };
      
      // Run comparison
      const comparisonResult = compareWithPredictions(
        irradianceInstallation,
        predictedData,
        {
          comparisonPeriod: 'daily',
          metrics: ['production'],
          normalizeWeather: false, // Don't normalize to test the parameter adjustment
          excludeOutliers: true
        }
      );
      
      // Optimize parameters
      const optimizedParams = optimizeParameters(
        [irradianceInstallation],
        [predictedData],
        {
          optimizeFor: ['production'],
          constraints: {
            maxIterations: 10,
            convergenceThreshold: 0.1,
            maxAdjustmentPerIteration: 0.05
          }
        }
      );
      
      // Verify that irradiance factor was adjusted correctly
      expect(optimizedParams.irradianceLinearFactor).not.toEqual(defaultParameters.irradianceLinearFactor);
    });
  });
  
  describe('Time-of-Day Pattern Tests', () => {
    test('should correctly identify and adjust for hourly consumption patterns', () => {
      // Create a modified sample with specific hourly patterns
      const hourlyReadings: ReadingData[] = [];
      
      // Generate 3 days of hourly data
      for (let day = 0; day < 3; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const date = new Date(2023, 3, day + 1); // April 1-3
          date.setHours(hour, 0, 0, 0);
          
          // Model realistic consumption patterns
          let consumption: number;
          
          if (hour >= 0 && hour <= 5) {
            // Night hours (00:00-05:59): low consumption
            consumption = 0.2 + Math.random() * 0.3; // 0.2-0.5 kWh
          } else if (hour >= 6 && hour <= 9) {
            // Morning peak (06:00-09:59): high consumption
            consumption = 1.5 + Math.random() * 1.0; // 1.5-2.5 kWh
          } else if (hour >= 10 && hour <= 16) {
            // Midday (10:00-16:59): moderate consumption
            consumption = 0.8 + Math.random() * 0.7; // 0.8-1.5 kWh
          } else if (hour >= 17 && hour <= 21) {
            // Evening peak (17:00-21:59): highest consumption
            consumption = 2.0 + Math.random() * 1.5; // 2.0-3.5 kWh
          } else {
            // Late evening (22:00-23:59): decreasing consumption
            consumption = 0.7 + Math.random() * 0.6; // 0.7-1.3 kWh
          }
          
          hourlyReadings.push({
            timestamp: date.toISOString(),
            period: 'hourly',
            consumption,
            production: 0, // Not relevant for this test
            weatherConditions: {
              temperature: 20 + Math.random() * 5, // 20-25°C
              irradiance: hour >= 6 && hour <= 18 ? 500 + Math.random() * 500 : 0, // Daylight hours only
              cloudCover: 20 + Math.random() * 60 // 20-80%
            }
          });
        }
      }
      
      // Create test installation with hourly readings
      const hourlyInstallation: InstallationData = {
        ...sampleInstallation,
        readings: hourlyReadings
      };
      
      // Create predicted data with systematic bias in peak hours
      // Underestimate morning peak by 20%
      // Underestimate evening peak by 30%
      const predictedData = {
        consumption: hourlyReadings.map(r => {
          const date = new Date(r.timestamp);
          const hour = date.getHours();
          
          if (hour >= 6 && hour <= 9) {
            return r.consumption * 0.8; // 20% underestimation for morning peak
          } else if (hour >= 17 && hour <= 21) {
            return r.consumption * 0.7; // 30% underestimation for evening peak
          } else {
            return r.consumption * (0.95 + Math.random() * 0.1); // ±5% random variation
          }
        }),
        timestamps: hourlyReadings.map(r => r.timestamp)
      };
      
      // Run comparison
      const comparisonResult = compareWithPredictions(
        hourlyInstallation,
        predictedData,
        {
          comparisonPeriod: 'daily', // Use daily for simplicity
          metrics: ['consumption'],
          normalizeWeather: false,
          excludeOutliers: true
        }
      );
      
      // Optimize parameters
      const optimizedParams = optimizeParameters(
        [hourlyInstallation],
        [predictedData],
        {
          optimizeFor: ['consumption'],
          constraints: {
            maxIterations: 10,
            convergenceThreshold: 0.1,
            maxAdjustmentPerIteration: 0.05
          }
        }
      );
      
      // Verify that time-of-day parameters were adjusted correctly
      expect(optimizedParams.peakHoursConsumptionFactor).toBeGreaterThan(defaultParameters.peakHoursConsumptionFactor);
    });
  });
  
  describe('Outlier Detection Tests', () => {
    test('should correctly identify and filter outliers in consumption data', () => {
      // Create a modified sample with outliers
      const readingsWithOutliers: ReadingData[] = [];
      
      // Generate 30 days of normal data
      for (let day = 1; day <= 30; day++) {
        const date = new Date(2023, 3, day); // April
        
        // Normal consumption: 10-15 kWh per day
        const normalConsumption = 10 + Math.random() * 5;
        
        readingsWithOutliers.push({
          timestamp: date.toISOString(),
          period: 'daily',
          consumption: normalConsumption,
          production: 5 + Math.random() * 5, // 5-10 kWh
          weatherConditions: {
            temperature: 15 + Math.random() * 10, // 15-25°C
            irradiance: 500 + Math.random() * 500, // 500-1000 W/m²
            cloudCover: 10 + Math.random() * 70 // 10-80%
          }
        });
      }
      
      // Add 5 outliers (very high consumption days)
      for (let i = 0; i < 5; i++) {
        const outlierDay = Math.floor(Math.random() * 30) + 1;
        const date = new Date(2023, 3, outlierDay); // Random day in April
        
        // Outlier consumption: 30-40 kWh (2-3x normal)
        const outlierConsumption = 30 + Math.random() * 10;
        
        readingsWithOutliers.push({
          timestamp: date.toISOString(),
          period: 'daily',
          consumption: outlierConsumption,
          production: 5 + Math.random() * 5, // Normal production
          weatherConditions: {
            temperature: 15 + Math.random() * 10, // Normal temperature
            irradiance: 500 + Math.random() * 500, // Normal irradiance
            cloudCover: 10 + Math.random() * 70 // Normal cloud cover
          }
        });
      }
      
      // Create test installation with outliers
      const outlierInstallation: InstallationData = {
        ...sampleInstallation,
        readings: readingsWithOutliers
      };
      
      // Create predicted data based on normal patterns
      const predictedData = {
        consumption: outlierInstallation.readings.map(r => {
          // Predict based on normal consumption range
          return 12.5 + (Math.random() * 2 - 1); // 11.5-13.5 kWh (centered around average normal consumption)
        }),
        production: outlierInstallation.readings.map(r => r.production!),
        timestamps: outlierInstallation.readings.map(r => r.timestamp)
      };
      
      // Run comparison with outlier exclusion disabled
      const comparisonWithOutliers = compareWithPredictions(
        outlierInstallation,
        predictedData,
        {
          comparisonPeriod: 'daily',
          metrics: ['consumption'],
          normalizeWeather: false,
          excludeOutliers: false
        }
      );
      
      // Run comparison with outlier exclusion enabled
      const comparisonWithoutOutliers = compareWithPredictions(
        outlierInstallation,
        predictedData,
        {
          comparisonPeriod: 'daily',
          metrics: ['consumption'],
          normalizeWeather: false,
          excludeOutliers: true
        }
      );
      
      // Verify that outlier exclusion improves accuracy
      expect(comparisonWithoutOutliers.metrics.totalConsumption.deviation)
        .toBeLessThan(comparisonWithOutliers.metrics.totalConsumption.deviation);
      
      // Optimize parameters with different outlier thresholds
      const optimizedParamsDefaultThreshold = optimizeParameters(
        [outlierInstallation],
        [predictedData],
        {
          optimizeFor: ['consumption'],
          constraints: {
            maxIterations: 5,
            convergenceThreshold: 0.1,
            maxAdjustmentPerIteration: 0.05
          },
          initialParameters: { ...defaultParameters }
        }
      );
      
      const optimizedParamsHigherThreshold = optimizeParameters(
        [outlierInstallation],
        [predictedData],
        {
          optimizeFor: ['consumption'],
          constraints: {
            maxIterations: 5,
            convergenceThreshold: 0.1,
            maxAdjustmentPerIteration: 0.05
          },
          initialParameters: { 
            ...defaultParameters,
            outlierThresholdFactor: 2.5 // Higher threshold includes more outliers
          }
        }
      );
      
      // Verify that outlier threshold was adjusted correctly
      expect(optimizedParamsDefaultThreshold.outlierThresholdFactor)
        .not.toEqual(optimizedParamsHigherThreshold.outlierThresholdFactor);
    });
  });
});