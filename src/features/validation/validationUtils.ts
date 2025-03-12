import { InstallationData, ValidationComparison, ValidationSettings, ReadingData } from './types';

/**
 * Utility functions for validating predictions against real installation data
 */

/**
 * Calculate the percentage deviation between predicted and actual values
 * @param predicted The predicted value
 * @param actual The actual value
 * @returns The percentage deviation
 */
export const calculateDeviation = (predicted: number, actual: number): number => {
  if (actual === 0) return predicted === 0 ? 0 : 100;
  return Math.abs((predicted - actual) / actual) * 100;
};

/**
 * Filter outliers from a dataset using the IQR method
 * @param data Array of numeric values
 * @returns Filtered array with outliers removed
 */
export const filterOutliers = (data: number[]): number[] => {
  if (data.length < 4) return data;
  
  // Sort the data
  const sortedData = [...data].sort((a, b) => a - b);
  
  // Calculate Q1 and Q3
  const q1Index = Math.floor(sortedData.length * 0.25);
  const q3Index = Math.floor(sortedData.length * 0.75);
  const q1 = sortedData[q1Index];
  const q3 = sortedData[q3Index];
  
  // Calculate IQR and bounds
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  // Filter outliers
  return data.filter(value => value >= lowerBound && value <= upperBound);
};

/**
 * Normalize weather conditions for fair comparison
 * @param readings Array of reading data
 * @param referenceTemp Reference temperature in Celsius
 * @param referenceIrradiance Reference irradiance in W/m²
 * @returns Normalized readings
 */
export const normalizeWeatherConditions = (
  readings: ReadingData[],
  referenceTemp: number = 25,
  referenceIrradiance: number = 1000
): ReadingData[] => {
  return readings.map(reading => {
    const normalizedReading = { ...reading };
    
    // Only normalize if weather conditions are available
    if (reading.weatherConditions) {
      const { temperature, irradiance } = reading.weatherConditions;
      
      // Normalize production based on temperature and irradiance
      // This is a simplified model - real implementations would use more complex formulas
      if (reading.production !== undefined && temperature !== undefined && irradiance !== undefined) {
        // Temperature coefficient (typical value for silicon PV: -0.4% per °C above 25°C)
        const tempCoefficient = -0.004;
        const tempCorrection = 1 + tempCoefficient * (temperature - referenceTemp);
        
        // Irradiance correction (linear approximation)
        const irradianceCorrection = irradiance / referenceIrradiance;
        
        // Apply corrections
        normalizedReading.production = reading.production * tempCorrection * irradianceCorrection;
      }
    }
    
    return normalizedReading;
  });
};

/**
 * Compare predicted data with actual installation data
 * @param installationData The real installation data
 * @param predictedData The predicted data for comparison
 * @param settings Validation settings
 * @returns Comparison results
 */
export const compareWithPredictions = (
  installationData: InstallationData,
  predictedData: {
    consumption: number[];
    production?: number[];
    timestamps: string[];
  },
  settings: ValidationSettings
): ValidationComparison => {
  // Extract readings for the comparison period
  let readings = installationData.readings.filter(reading => {
    return reading.period.toLowerCase() === settings.comparisonPeriod.toLowerCase();
  });
  
  // Apply weather normalization if enabled
  if (settings.normalizeWeather) {
    readings = normalizeWeatherConditions(readings);
  }
  
  // Calculate actual totals
  let actualConsumption = readings.reduce((sum, reading) => sum + reading.consumption, 0);
  let actualProduction = readings.some(r => r.production !== undefined)
    ? readings.reduce((sum, reading) => sum + (reading.production || 0), 0)
    : undefined;
  
  // Calculate predicted totals
  const predictedConsumption = predictedData.consumption.reduce((sum, value) => sum + value, 0);
  const predictedProduction = predictedData.production
    ? predictedData.production.reduce((sum, value) => sum + value, 0)
    : undefined;
  
  // Remove outliers if enabled
  if (settings.excludeOutliers) {
    const consumptionValues = readings.map(r => r.consumption);
    const filteredConsumption = filterOutliers(consumptionValues);
    actualConsumption = filteredConsumption.reduce((sum, value) => sum + value, 0);
    
    if (actualProduction !== undefined) {
      const productionValues = readings
        .filter(r => r.production !== undefined)
        .map(r => r.production as number);
      const filteredProduction = filterOutliers(productionValues);
      actualProduction = filteredProduction.reduce((sum, value) => sum + value, 0);
    }
  }
  
  // Calculate self-consumption if both consumption and production are available
  let selfConsumption: { predicted?: number; actual?: number; deviation?: number } = {};
  if (actualProduction !== undefined && predictedProduction !== undefined) {
    // Simplified self-consumption calculation
    const actualSelfConsumption = Math.min(actualConsumption, actualProduction);
    const predictedSelfConsumption = Math.min(predictedConsumption, predictedProduction);
    
    selfConsumption = {
      predicted: predictedSelfConsumption,
      actual: actualSelfConsumption,
      deviation: calculateDeviation(predictedSelfConsumption, actualSelfConsumption)
    };
  }
  
  // Calculate cost savings (simplified example)
  let costSavings: { predicted?: number; actual?: number; deviation?: number } = {};
  const electricityPrice = 0.15; // €/kWh - this would come from actual tariff data
  
  if (actualProduction !== undefined && predictedProduction !== undefined) {
    const actualSavings = (selfConsumption.actual || 0) * electricityPrice;
    const predictedSavings = (selfConsumption.predicted || 0) * electricityPrice;
    
    costSavings = {
      predicted: predictedSavings,
      actual: actualSavings,
      deviation: calculateDeviation(predictedSavings, actualSavings)
    };
  }
  
  // Prepare hourly comparison data if available
  const hourlyComparison = readings.length === predictedData.timestamps.length
    ? readings.map((reading, index) => ({
        timestamp: reading.timestamp,
        consumption: {
          predicted: predictedData.consumption[index],
          actual: reading.consumption
        },
        production: reading.production !== undefined && predictedData.production
          ? {
              predicted: predictedData.production[index],
              actual: reading.production
            }
          : undefined
      }))
    : undefined;
  
  // Construct the comparison result
  return {
    installationId: installationData.installationId,
    period: {
      start: readings.length > 0 ? readings[0].timestamp : '',
      end: readings.length > 0 ? readings[readings.length - 1].timestamp : ''
    },
    metrics: {
      totalConsumption: {
        predicted: predictedConsumption,
        actual: actualConsumption,
        deviation: calculateDeviation(predictedConsumption, actualConsumption)
      },
      ...(actualProduction !== undefined && predictedProduction !== undefined
        ? {
            totalProduction: {
              predicted: predictedProduction,
              actual: actualProduction,
              deviation: calculateDeviation(predictedProduction, actualProduction)
            }
          }
        : {}),
      ...(Object.keys(selfConsumption).length > 0
        ? { selfConsumption: selfConsumption as any }
        : {}),
      ...(Object.keys(costSavings).length > 0
        ? { costSavings: costSavings as any }
        : {})
    },
    hourlyComparison
  };
};

/**
 * Generate a sample installation data set for testing
 * @returns Sample installation data
 */
export const generateSampleInstallationData = (): InstallationData => {
  const now = new Date();
  const readings: ReadingData[] = [];
  
  // Generate 30 days of daily readings
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Random consumption between 8-15 kWh per day
    const consumption = 8 + Math.random() * 7;
    
    // Random production between 5-12 kWh per day (affected by weather)
    const temperature = 15 + Math.random() * 15; // 15-30°C
    const cloudCover = Math.random() * 100; // 0-100%
    const irradiance = 200 + (1000 - 200) * (1 - cloudCover / 100); // 200-1000 W/m²
    
    // Production is affected by weather
    const production = (5 + Math.random() * 7) * (1 - cloudCover / 200) * (1 - (temperature - 25) * 0.004);
    
    readings.push({
      timestamp: date.toISOString(),
      period: 'daily',
      consumption,
      production,
      gridImport: Math.max(0, consumption - production),
      gridExport: Math.max(0, production - consumption),
      weatherConditions: {
        temperature,
        irradiance,
        cloudCover
      }
    });
  }
  
  return {
    installationId: 'sample-installation-001',
    installationName: 'Casa Ejemplo',
    installationType: 'residential',
    location: {
      city: 'Madrid',
      region: 'Comunidad de Madrid',
      country: 'España'
    },
    installedCapacity: 5, // 5 kW
    installationDate: '2023-01-15',
    panelType: 'Monocristalino 400W',
    inverterType: 'Huawei SUN2000-5KTL',
    batteryCapacity: 0, // No battery
    readings
  };
};