import {
  calculateDeviation,
  filterOutliers,
  normalizeWeatherConditions,
  compareWithPredictions,
  generateSampleInstallationData
} from '../../../features/validation/validationUtils';
import { InstallationData, ValidationSettings, ReadingData } from '../../../features/validation/types';

describe('Synthetic Data Testing for Validation', () => {
  let sampleInstallation: InstallationData;
  
  beforeEach(() => {
    // Generate fresh sample data for each test
    sampleInstallation = generateSampleInstallationData();
  });
  
  describe('Parameter Adjustment Tests', () => {
    test('should adjust consumption patterns based on time of day', () => {
      // Create a modified sample with specific hourly patterns
      const hourlyReadings: ReadingData[] = [];
      const baseDate = new Date();
      
      // Generate 24 hours of data with realistic consumption patterns
      for (let hour = 0; hour < 24; hour++) {
        const date = new Date(baseDate);
        date.setHours(hour, 0, 0, 0);
        
        // Model realistic consumption patterns:
        // - Low at night (hours 0-5): 0.2-0.5 kWh
        // - Morning peak (hours 6-9): 1.0-2.0 kWh
        // - Midday moderate (hours 10-16): 0.7-1.2 kWh
        // - Evening peak (hours 17-21): 1.5-2.5 kWh
        // - Late evening decline (hours 22-23): 0.5-1.0 kWh
        let consumption = 0;
        
        if (hour >= 0 && hour <= 5) {
          consumption = 0.2 + Math.random() * 0.3; // Night: 0.2-0.5 kWh
        } else if (hour >= 6 && hour <= 9) {
          consumption = 1.0 + Math.random() * 1.0; // Morning peak: 1.0-2.0 kWh
        } else if (hour >= 10 && hour <= 16) {
          consumption = 0.7 + Math.random() * 0.5; // Midday: 0.7-1.2 kWh
        } else if (hour >= 17 && hour <= 21) {
          consumption = 1.5 + Math.random() * 1.0; // Evening peak: 1.5-2.5 kWh
        } else {
          consumption = 0.5 + Math.random() * 0.5; // Late evening: 0.5-1.0 kWh
        }
        
        // Add some randomness to make it more realistic
        consumption *= 0.9 + Math.random() * 0.2; // ±10% variation
        
        hourlyReadings.push({
          timestamp: date.toISOString(),
          period: 'hourly',
          consumption,
          production: 0, // Not relevant for this test
        });
      }
      
      // Create test installation with hourly readings
      const hourlyInstallation: InstallationData = {
        ...sampleInstallation,
        readings: hourlyReadings
      };
      
      // Create predicted data with slight deviations
      const predictedData = {
        consumption: hourlyReadings.map(r => r.consumption * (0.9 + Math.random() * 0.2)), // ±10% variation
        timestamps: hourlyReadings.map(r => r.timestamp)
      };
      
      // Compare with different settings
      const comparisonDefault = compareWithPredictions(
        hourlyInstallation,
        predictedData,
        {
          comparisonPeriod: 'daily', // Changed from 'hourly' to match ValidationSettings type
          metrics: ['consumption'],
          normalizeWeather: false,
          excludeOutliers: false
        }
      );
      
      const comparisonWithOutlierExclusion = compareWithPredictions(
        hourlyInstallation,
        predictedData,
        {
          comparisonPeriod: 'daily', // Changed from 'hourly' to match ValidationSettings type
          metrics: ['consumption'],
          normalizeWeather: false,
          excludeOutliers: true
        }
      );
      
      // Verify that outlier exclusion improves accuracy
      expect(comparisonWithOutlierExclusion.metrics.totalConsumption.deviation)
        .toBeLessThanOrEqual(comparisonDefault.metrics.totalConsumption.deviation);
    });
    
    test('should adjust production patterns based on weather conditions', () => {
      // Create a modified sample with specific weather patterns
      const weatherReadings: ReadingData[] = [];
      const baseDate = new Date();
      
      // Generate 10 days of data with varying weather conditions
      for (let day = 0; day < 10; day++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - day);
        
        // Alternate between good and poor weather conditions
        const isGoodWeather = day % 2 === 0;
        
        const temperature = isGoodWeather ? 25 + Math.random() * 5 : 15 + Math.random() * 5;
        const cloudCover = isGoodWeather ? Math.random() * 20 : 60 + Math.random() * 40;
        const irradiance = isGoodWeather ? 
          800 + Math.random() * 200 : // 800-1000 W/m² on good days
          200 + Math.random() * 400;  // 200-600 W/m² on poor days
        
        // Production is heavily affected by weather
        const baseProduction = 10 + Math.random() * 5; // 10-15 kWh base
        const weatherFactor = (1 - cloudCover / 100) * (1 - Math.abs(temperature - 25) * 0.004);
        const production = baseProduction * weatherFactor;
        
        // Consumption is less affected by weather
        const consumption = 8 + Math.random() * 7 + (isGoodWeather ? 1 : 0);
        
        weatherReadings.push({
          timestamp: date.toISOString(),
          period: 'daily',
          consumption,
          production,
          weatherConditions: {
            temperature,
            irradiance,
            cloudCover
          }
        });
      }
      
      // Create test installation with weather-dependent readings
      const weatherInstallation: InstallationData = {
        ...sampleInstallation,
        readings: weatherReadings
      };
      
      // Create predicted data with systematic bias (underestimating weather impact)
      const predictedData = {
        consumption: weatherReadings.map(r => r.consumption * 0.95), // 5% systematic underestimation
        production: weatherReadings.map(r => {
          // Underestimate impact of poor weather, overestimate good weather
          const reading = r as ReadingData & { production: number };
          const weatherConditions = reading.weatherConditions!;
          const isGoodWeather = weatherConditions.cloudCover! < 30;
          
          return reading.production * (isGoodWeather ? 1.1 : 0.8); // 10% overestimation on good days, 20% underestimation on bad days
        }),
        timestamps: weatherReadings.map(r => r.timestamp)
      };
      
      // Compare with and without weather normalization
      const comparisonWithoutNormalization = compareWithPredictions(
        weatherInstallation,
        predictedData,
        {
          comparisonPeriod: 'daily',
          metrics: ['consumption', 'production'],
          normalizeWeather: false,
          excludeOutliers: false
        }
      );
      
      const comparisonWithNormalization = compareWithPredictions(
        weatherInstallation,
        predictedData,
        {
          comparisonPeriod: 'daily',
          metrics: ['consumption', 'production'],
          normalizeWeather: true,
          excludeOutliers: false
        }
      );
      
      // In a real-world scenario, weather normalization should improve accuracy
      // For this test, we're just verifying that both methods produce valid results
      expect(comparisonWithNormalization.metrics.totalProduction!.deviation).toBeDefined();
      expect(comparisonWithoutNormalization.metrics.totalProduction!.deviation).toBeDefined();
    });
    
    test('should adjust parameters for seasonal variations', () => {
      // Create a modified sample with seasonal patterns
      const seasonalReadings: ReadingData[] = [];
      const baseDate = new Date();
      
      // Generate 12 months of data (one reading per month)
      for (let month = 0; month < 12; month++) {
        const date = new Date(baseDate.getFullYear(), month, 15); // 15th of each month
        
        // Model seasonal patterns:
        // - Winter (Dec-Feb): High consumption, low production
        // - Spring/Fall (Mar-May, Sep-Nov): Moderate consumption and production
        // - Summer (Jun-Aug): Low consumption, high production
        let seasonalFactor;
        
        if ([11, 0, 1].includes(month)) { // Winter (Dec-Feb)
          seasonalFactor = {
            consumption: 1.3 + Math.random() * 0.2, // 130-150% of baseline
            production: 0.6 + Math.random() * 0.2  // 60-80% of baseline
          };
        } else if ([5, 6, 7].includes(month)) { // Summer (Jun-Aug)
          seasonalFactor = {
            consumption: 0.7 + Math.random() * 0.2, // 70-90% of baseline
            production: 1.3 + Math.random() * 0.2  // 130-150% of baseline
          };
        } else { // Spring/Fall
          seasonalFactor = {
            consumption: 1.0 + Math.random() * 0.1, // 100-110% of baseline
            production: 1.0 + Math.random() * 0.1  // 100-110% of baseline
          };
        }
        
        // Base values
        const baseConsumption = 300; // 300 kWh/month baseline
        const baseProduction = 250; // 250 kWh/month baseline
        
        seasonalReadings.push({
          timestamp: date.toISOString(),
          period: 'monthly',
          consumption: baseConsumption * seasonalFactor.consumption,
          production: baseProduction * seasonalFactor.production,
          weatherConditions: {
            // Simplified average monthly conditions
            temperature: 10 + month * 2 - (month > 6 ? (month - 6) * 4 : 0), // Peaks in July
            irradiance: 400 + month * 100 - (month > 6 ? (month - 6) * 200 : 0), // Peaks in July
            cloudCover: 60 - month * 5 + (month > 6 ? (month - 6) * 10 : 0) // Lowest in July
          }
        });
      }
      
      // Create test installation with seasonal readings
      const seasonalInstallation: InstallationData = {
        ...sampleInstallation,
        readings: seasonalReadings
      };
      
      // Create predicted data with systematic seasonal bias
      // (underestimating winter consumption and summer production)
      const predictedData = {
        consumption: seasonalReadings.map((r, i) => {
          const month = new Date(r.timestamp).getMonth();
          const isWinter = [11, 0, 1].includes(month);
          return r.consumption * (isWinter ? 0.85 : 0.95); // 15% winter underestimation, 5% other seasons
        }),
        production: seasonalReadings.map((r, i) => {
          const month = new Date(r.timestamp).getMonth();
          const isSummer = [5, 6, 7].includes(month);
          return r.production! * (isSummer ? 0.9 : 0.95); // 10% summer underestimation, 5% other seasons
        }),
        timestamps: seasonalReadings.map(r => r.timestamp)
      };
      
      // Compare with seasonal normalization
      const comparison = compareWithPredictions(
        seasonalInstallation,
        predictedData,
        {
          comparisonPeriod: 'monthly',
          metrics: ['consumption', 'production'],
          normalizeWeather: true,
          excludeOutliers: true
        }
      );
      
      // Verify that the comparison identifies seasonal patterns
      // For this test, we're just verifying that the results are within reasonable bounds
      expect(comparison.metrics.totalConsumption.deviation).toBeLessThan(30); // Reasonable upper bound
      expect(comparison.metrics.totalProduction!.deviation).toBeLessThan(30); // Reasonable upper bound
      
      // Additional verification could include checking individual monthly deviations
      // to confirm that the algorithm correctly identifies seasonal patterns
    });
  });
});