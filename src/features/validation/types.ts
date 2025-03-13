/**
 * Types and interfaces for the validation module
 */

/**
 * Interface for real installation data
 */
export interface InstallationData {
  // Basic information
  installationId: string;
  installationName: string;
  installationType: 'residential' | 'commercial' | 'industrial';
  location: {
    city: string;
    region: string;
    country: string;
  };
  
  // Technical specifications
  installedCapacity: number; // in kW
  installationDate: string;
  panelType?: string;
  inverterType?: string;
  batteryCapacity?: number; // in kWh
  
  // Consumption and production data
  readings: ReadingData[];
}

/**
 * Interface for a single reading data point
 */
export interface ReadingData {
  timestamp: string;
  period: 'hourly' | 'daily' | 'monthly';
  consumption: number; // in kWh
  production?: number; // in kWh
  gridImport?: number; // in kWh
  gridExport?: number; // in kWh
  batteryCharge?: number; // in kWh
  batteryDischarge?: number; // in kWh
  weatherConditions?: {
    temperature?: number; // in Celsius
    irradiance?: number; // in W/m²
    cloudCover?: number; // percentage
  };
}

/**
 * Interface for comparison between predicted and actual data
 */
export interface ValidationComparison {
  installationId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalConsumption: {
      predicted: number;
      actual: number;
      deviation: number; // percentage
    };
    totalProduction?: {
      predicted: number;
      actual: number;
      deviation: number; // percentage
    };
    selfConsumption?: {
      predicted: number;
      actual: number;
      deviation: number; // percentage
    };
    costSavings?: {
      predicted: number;
      actual: number;
      deviation: number; // percentage
    };
  };
  hourlyComparison?: {
    timestamp: string;
    consumption: {
      predicted: number;
      actual: number;
    };
    production?: {
      predicted: number;
      actual: number;
    };
  }[];
  anomalies?: {
    date: string;
    metric: string;
    predicted: number;
    actual: number;
    deviation: number;
    severity: string;
  }[];
  dailyComparisons?: {
    date: string;
    consumption: {
      predicted: number;
      actual: number;
      deviation: number;
    };
    production?: {
      predicted: number;
      actual: number;
      deviation: number;
    };
  }[];
}

/**
 * Interface for validation settings
 */
export interface ValidationSettings {
  comparisonPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metrics: string[];
  normalizeWeather: boolean;
  excludeOutliers: boolean;
}