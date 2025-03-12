import {
  calculateDeviation,
  filterOutliers,
  normalizeWeatherConditions,
  compareWithPredictions,
  generateSampleInstallationData
} from '../../../features/validation/validationUtils';
import { InstallationData, ValidationSettings, ReadingData } from '../../../features/validation/types';

describe('Validation Utilities', () => {
  describe('calculateDeviation', () => {
    test('should calculate correct deviation between two values', () => {
      expect(calculateDeviation(100, 80)).toBeCloseTo(25);
      expect(calculateDeviation(80, 100)).toBeCloseTo(20);
    });

    test('should handle zero actual value', () => {
      expect(calculateDeviation(100, 0)).toBe(100);
      expect(calculateDeviation(0, 0)).toBe(0);
    });

    test('should handle negative values', () => {
      expect(calculateDeviation(-100, -80)).toBeCloseTo(25);
      expect(calculateDeviation(-80, -100)).toBeCloseTo(20);
    });
  });

  describe('filterOutliers', () => {
    test('should remove outliers from dataset using IQR method', () => {
      const data = [1, 2, 2, 3, 4, 5, 5, 6, 100];
      const filtered = filterOutliers(data);
      
      // The outlier (100) should be removed
      expect(filtered).not.toContain(100);
      expect(filtered.length).toBe(8);
    });

    test('should return original dataset if no outliers', () => {
      const data = [1, 2, 3, 4, 5];
      const filtered = filterOutliers(data);
      
      expect(filtered).toEqual(data);
      expect(filtered.length).toBe(5);
    });

    test('should handle small datasets (less than 4 elements)', () => {
      const data = [1, 2, 3];
      const filtered = filterOutliers(data);
      
      expect(filtered).toEqual(data);
    });

    test('should handle datasets with multiple outliers', () => {
      const data = [1, 2, 3, 4, 5, 100, 200];
      const filtered = filterOutliers(data);
      
      expect(filtered).not.toContain(100);
      expect(filtered).not.toContain(200);
      expect(filtered.length).toBe(5);
    });
  });

  describe('normalizeWeatherConditions', () => {
    test('should normalize production based on temperature and irradiance', () => {
      const readings: ReadingData[] = [
        {
          timestamp: '2023-01-01T12:00:00Z',
          period: 'hourly',
          consumption: 5,
          production: 10,
          weatherConditions: {
            temperature: 30, // 5°C above reference
            irradiance: 800 // 80% of reference
          }
        }
      ];

      const normalized = normalizeWeatherConditions(readings);
      
      // Expected calculation:
      // tempCorrection = 1 + (-0.004 * (30 - 25)) = 1 - 0.02 = 0.98
      // irradianceCorrection = 800 / 1000 = 0.8
      // normalizedProduction = 10 * 0.98 * 0.8 = 7.84
      expect(normalized[0].production).toBeCloseTo(7.84);
    });

    test('should not modify readings without weather conditions', () => {
      const readings: ReadingData[] = [
        {
          timestamp: '2023-01-01T12:00:00Z',
          period: 'hourly',
          consumption: 5,
          production: 10
        }
      ];

      const normalized = normalizeWeatherConditions(readings);
      
      expect(normalized[0].production).toBe(10);
    });

    test('should not modify readings without production data', () => {
      const readings: ReadingData[] = [
        {
          timestamp: '2023-01-01T12:00:00Z',
          period: 'hourly',
          consumption: 5,
          weatherConditions: {
            temperature: 30,
            irradiance: 800
          }
        }
      ];

      const normalized = normalizeWeatherConditions(readings);
      
      expect(normalized[0].production).toBeUndefined();
    });

    test('should use custom reference values when provided', () => {
      const readings: ReadingData[] = [
        {
          timestamp: '2023-01-01T12:00:00Z',
          period: 'hourly',
          consumption: 5,
          production: 10,
          weatherConditions: {
            temperature: 20, // 0°C from custom reference
            irradiance: 500 // 50% of custom reference
          }
        }
      ];

      const normalized = normalizeWeatherConditions(readings, 20, 1000);
      
      // Expected calculation:
      // tempCorrection = 1 + (-0.004 * (20 - 20)) = 1
      // irradianceCorrection = 500 / 1000 = 0.5
      // normalizedProduction = 10 * 1 * 0.5 = 5
      expect(normalized[0].production).toBeCloseTo(5);
    });
  });

  describe('compareWithPredictions', () => {
    let sampleInstallation: InstallationData;
    let predictedData: { consumption: number[]; production?: number[]; timestamps: string[] };
    let settings: ValidationSettings;

    beforeEach(() => {
      // Generate sample installation data
      sampleInstallation = generateSampleInstallationData();
      
      // Create sample predicted data
      predictedData = {
        consumption: sampleInstallation.readings.map(r => r.consumption * 1.1), // 10% higher
        production: sampleInstallation.readings.map(r => (r.production || 0) * 0.9), // 10% lower
        timestamps: sampleInstallation.readings.map(r => r.timestamp)
      };
      
      // Default settings
      settings = {
        comparisonPeriod: 'daily',
        metrics: ['consumption', 'production'],
        normalizeWeather: false,
        excludeOutliers: false
      };
    });

    test('should calculate correct deviations between predicted and actual values', () => {
      const comparison = compareWithPredictions(sampleInstallation, predictedData, settings);
      
      // Check that the comparison contains the expected metrics
      expect(comparison.metrics.totalConsumption).toBeDefined();
      expect(comparison.metrics.totalProduction).toBeDefined();
      
      // Verify the deviation calculations
      // Predicted consumption is 10% higher, so deviation should be around 10%
      expect(comparison.metrics.totalConsumption.deviation).toBeGreaterThan(5);
      expect(comparison.metrics.totalConsumption.deviation).toBeLessThan(15);
      
      // Predicted production is 10% lower, so deviation should be around 10%
      expect(comparison.metrics.totalProduction?.deviation).toBeGreaterThan(5);
      expect(comparison.metrics.totalProduction?.deviation).toBeLessThan(15);
    });

    test('should apply weather normalization when enabled', () => {
      // Enable weather normalization
      settings.normalizeWeather = true;
      
      const comparison = compareWithPredictions(sampleInstallation, predictedData, settings);
      
      // The deviation should be different when weather normalization is applied
      expect(comparison.metrics.totalProduction?.deviation).not.toBeUndefined();
    });

    test('should exclude outliers when enabled', () => {
      // Add an outlier to the sample data
      sampleInstallation.readings[0].consumption = 1000; // Much higher than other values
      
      // Run comparison without outlier exclusion
      const comparisonWithOutliers = compareWithPredictions(sampleInstallation, predictedData, settings);
      
      // Enable outlier exclusion
      settings.excludeOutliers = true;
      const comparisonWithoutOutliers = compareWithPredictions(sampleInstallation, predictedData, settings);
      
      // The actual consumption should be lower when outliers are excluded
      expect(comparisonWithoutOutliers.metrics.totalConsumption.actual)
        .toBeLessThan(comparisonWithOutliers.metrics.totalConsumption.actual);
    });

    test('should calculate self-consumption when both consumption and production are available', () => {
      const comparison = compareWithPredictions(sampleInstallation, predictedData, settings);
      
      // Check that self-consumption metrics are calculated
      expect(comparison.metrics.selfConsumption).toBeDefined();
      expect(comparison.metrics.selfConsumption?.predicted).toBeGreaterThan(0);
      expect(comparison.metrics.selfConsumption?.actual).toBeGreaterThan(0);
      expect(comparison.metrics.selfConsumption?.deviation).toBeDefined();
    });

    test('should calculate cost savings', () => {
      const comparison = compareWithPredictions(sampleInstallation, predictedData, settings);
      
      // Check that cost savings metrics are calculated
      expect(comparison.metrics.costSavings).toBeDefined();
      expect(comparison.metrics.costSavings?.predicted).toBeGreaterThan(0);
      expect(comparison.metrics.costSavings?.actual).toBeGreaterThan(0);
      expect(comparison.metrics.costSavings?.deviation).toBeDefined();
    });

    test('should generate hourly comparison data when timestamps match', () => {
      const comparison = compareWithPredictions(sampleInstallation, predictedData, settings);
      
      // Check that hourly comparison data is generated
      expect(comparison.hourlyComparison).toBeDefined();
      expect(comparison.hourlyComparison?.length).toBe(sampleInstallation.readings.length);
      
      // Check the structure of hourly comparison data
      if (comparison.hourlyComparison) {
        const firstHour = comparison.hourlyComparison[0];
        expect(firstHour.timestamp).toBe(sampleInstallation.readings[0].timestamp);
        expect(firstHour.consumption.predicted).toBe(predictedData.consumption[0]);
        expect(firstHour.consumption.actual).toBe(sampleInstallation.readings[0].consumption);
        expect(firstHour.production?.predicted).toBe(predictedData.production?.[0]);
        expect(firstHour.production?.actual).toBe(sampleInstallation.readings[0].production);
      }
    });

    test('should handle missing production data', () => {
      // Remove production data from predicted data
      const predictedConsumptionOnly = {
        consumption: predictedData.consumption,
        timestamps: predictedData.timestamps
      };
      
      const comparison = compareWithPredictions(sampleInstallation, predictedConsumptionOnly, settings);
      
      // Check that production metrics are not included
      expect(comparison.metrics.totalProduction).toBeUndefined();
      expect(comparison.metrics.selfConsumption).toBeUndefined();
      expect(comparison.metrics.costSavings).toBeUndefined();
    });
  });

  describe('generateSampleInstallationData', () => {
    test('should generate valid installation data with expected structure', () => {
      const sampleData = generateSampleInstallationData();
      
      // Check basic structure
      expect(sampleData.installationId).toBeDefined();
      expect(sampleData.installationName).toBeDefined();
      expect(sampleData.installationType).toBeDefined();
      expect(sampleData.location).toBeDefined();
      expect(sampleData.installedCapacity).toBeGreaterThan(0);
      
      // Check readings
      expect(Array.isArray(sampleData.readings)).toBe(true);
      expect(sampleData.readings.length).toBe(30); // 30 days of data
      
      // Check reading structure
      const firstReading = sampleData.readings[0];
      expect(firstReading.timestamp).toBeDefined();
      expect(firstReading.period).toBe('daily');
      expect(firstReading.consumption).toBeGreaterThan(0);
      expect(firstReading.production).toBeGreaterThan(0);
      expect(firstReading.weatherConditions).toBeDefined();
    });
  });
});