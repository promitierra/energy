import {
  optimizeParameters,
  defaultParameters,
  ParameterSet,
  ParameterAdjustmentOptions
} from '../../../features/validation/parameterAdjustment';
import { generateSampleInstallationData } from '../../../features/validation/validationUtils';
import { InstallationData, ReadingData } from '../../../features/validation/types';

describe('Parameter Adjustment Tests', () => {
  let sampleInstallation: InstallationData;
  
  beforeEach(() => {
    // Generate fresh sample data for each test
    sampleInstallation = generateSampleInstallationData();
  });
  
  test('should optimize parameters for consumption prediction', () => {
    // Create test data with known biases
    const testData: InstallationData[] = [createTestInstallation()];
    
    // Create predicted data with systematic bias
    const predictedData = [{
      consumption: testData[0].readings.map(r => r.consumption * 0.9), // 10% underestimation
      timestamps: testData[0].readings.map(r => r.timestamp)
    }];
    
    // Define optimization options
    const options: ParameterAdjustmentOptions = {
      optimizeFor: ['consumption'],
      constraints: {
        maxIterations: 5,
        convergenceThreshold: 0.1,
        maxAdjustmentPerIteration: 0.05
      }
    };
    
    // Optimize parameters
    const optimizedParams = optimizeParameters(testData, predictedData, options);
    
    // Verify that parameters were adjusted
    expect(optimizedParams).not.toEqual(defaultParameters);
    
    // Verify that seasonal parameters were adjusted correctly
    // Since we have a systematic 10% underestimation, we expect factors to increase
    expect(optimizedParams.winterConsumptionFactor).toBeGreaterThan(defaultParameters.winterConsumptionFactor);
    expect(optimizedParams.summerConsumptionFactor).toBeGreaterThan(defaultParameters.summerConsumptionFactor);
  });
  
  test('should optimize parameters for production prediction with weather bias', () => {
    // Create test data with weather-dependent production
    const testData: InstallationData[] = [createWeatherTestInstallation()];
    
    // Create predicted data with weather-related bias
    const predictedData = [{
      consumption: testData[0].readings.map(r => r.consumption),
      production: testData[0].readings.map(r => {
        // Underestimate impact of temperature
        if (r.weatherConditions?.temperature && r.weatherConditions.temperature > 30) {
          return r.production! * 0.8; // 20% underestimation on hot days
        }
        return r.production!;
      }),
      timestamps: testData[0].readings.map(r => r.timestamp)
    }];
    
    // Define optimization options
    const options: ParameterAdjustmentOptions = {
      optimizeFor: ['production'],
      constraints: {
        maxIterations: 5,
        convergenceThreshold: 0.1,
        maxAdjustmentPerIteration: 0.05
      }
    };
    
    // Optimize parameters
    const optimizedParams = optimizeParameters(testData, predictedData, options);
    
    // Verify that parameters were adjusted
    expect(optimizedParams).not.toEqual(defaultParameters);
    
    // Verify that temperature coefficient was adjusted
    // Since we underestimate impact of high temperatures, we expect the coefficient to become more negative
    expect(Math.abs(optimizedParams.temperatureCoefficient)).toBeGreaterThan(
      Math.abs(defaultParameters.temperatureCoefficient)
    );
  });
  
  test('should converge within specified iterations', () => {
    // Create test data
    const testData: InstallationData[] = [createTestInstallation()];
    
    // Create predicted data with random noise
    const predictedData = [{
      consumption: testData[0].readings.map(r => r.consumption * (0.9 + Math.random() * 0.2)),
      production: testData[0].readings.map(r => r.production! * (0.9 + Math.random() * 0.2)),
      timestamps: testData[0].readings.map(r => r.timestamp)
    }];
    
    // Define optimization options with very strict convergence
    const options: ParameterAdjustmentOptions = {
      optimizeFor: ['consumption', 'production'],
      constraints: {
        maxIterations: 3, // Force to stop after 3 iterations
        convergenceThreshold: 0.001, // Very strict convergence unlikely to be met
        maxAdjustmentPerIteration: 0.05
      }
    };
    
    // Optimize parameters
    const optimizedParams = optimizeParameters(testData, predictedData, options);
    
    // Verify that parameters were adjusted
    expect(optimizedParams).not.toEqual(defaultParameters);
    
    // We can't verify exact convergence, but we can verify that the function returns
    // without error and produces reasonable parameters
    Object.values(optimizedParams).forEach(value => {
      expect(typeof value).toBe('number');
      expect(isFinite(value)).toBe(true);
      expect(value).not.toBeNaN();
    });
  });
});

/**
 * Create a test installation with seasonal patterns
 */
function createTestInstallation(): InstallationData {
  const baseInstallation = generateSampleInstallationData();
  const readings: ReadingData[] = [];
  const now = new Date();
  
  // Generate 12 months of data (one reading per month)
  for (let month = 0; month < 12; month++) {
    const date = new Date(now.getFullYear(), month, 15); // 15th of each month
    
    // Model seasonal patterns
    let seasonalFactor;
    
    if ([11, 0, 1].includes(month)) { // Winter (Dec-Feb)
      seasonalFactor = {
        consumption: 1.3,
        production: 0.7
      };
    } else if ([5, 6, 7].includes(month)) { // Summer (Jun-Aug)
      seasonalFactor = {
        consumption: 0.8,
        production: 1.2
      };
    } else { // Spring/Fall
      seasonalFactor = {
        consumption: 1.0,
        production: 1.0
      };
    }
    
    // Base values
    const baseConsumption = 300; // 300 kWh/month baseline
    const baseProduction = 250; // 250 kWh/month baseline
    
    readings.push({
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
  
  return {
    ...baseInstallation,
    readings
  };
}

/**
 * Create a test installation with weather-dependent production
 */
function createWeatherTestInstallation(): InstallationData {
  const baseInstallation = generateSampleInstallationData();
  const readings: ReadingData[] = [];
  const now = new Date();
  
  // Generate 30 days of data with varying weather conditions
  for (let day = 0; day < 30; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    // Create varying weather conditions
    const isHotDay = day % 5 === 0; // Every 5th day is very hot
    const isCloudy = day % 3 === 0; // Every 3rd day is cloudy
    
    const temperature = isHotDay ? 32 + Math.random() * 5 : 20 + Math.random() * 10;
    const cloudCover = isCloudy ? 70 + Math.random() * 30 : Math.random() * 30;
    const irradiance = isCloudy ? 
      200 + Math.random() * 300 : // 200-500 W/m² on cloudy days
      700 + Math.random() * 300;  // 700-1000 W/m² on clear days
    
    // Production is heavily affected by weather
    const baseProduction = 10 + Math.random() * 5; // 10-15 kWh base
    
    // Temperature effect: -0.4% per °C above 25°C
    const tempEffect = temperature > 25 ? 1 - 0.004 * (temperature - 25) : 1;
    
    // Cloud cover effect: linear reduction based on cloud cover percentage
    const cloudEffect = 1 - (cloudCover / 100) * 0.7;
    
    // Irradiance effect: linear relationship with irradiance
    const irradianceEffect = irradiance / 1000;
    
    const production = baseProduction * tempEffect * cloudEffect * irradianceEffect;
    
    // Consumption is less affected by weather
    const consumption = 8 + Math.random() * 7 + (isHotDay ? 3 : 0); // Higher consumption on hot days
    
    readings.push({
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
  
  return {
    ...baseInstallation,
    readings
  };
}