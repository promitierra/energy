/**
 * Utilities for optimizing JSON data size and loading performance
 * Implements various techniques to reduce JSON file sizes and improve loading times
 */

import { compressChartData, decompressChartData } from './dataCompression';

/**
 * Removes redundant data structures from JSON objects
 * @param data The JSON data to optimize
 * @returns Optimized JSON data with redundancies removed
 */
export function removeRedundancies<T extends Record<string, any>>(data: T): T {
  if (!data) return data;
  
  // For arrays, process each item
  if (Array.isArray(data)) {
    return data.map(item => removeRedundancies(item)) as unknown as T;
  }
  
  // For objects, process each property
  if (typeof data === 'object') {
    const result: Record<string, any> = {};
    
    // Process each property
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        
        // Skip null or undefined values
        if (value === null || value === undefined) continue;
        
        // Skip empty arrays
        if (Array.isArray(value) && value.length === 0) continue;
        
        // Skip empty objects
        if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) continue;
        
        // Process nested objects/arrays recursively
        result[key] = removeRedundancies(value);
      }
    }
    
    return result as T;
  }
  
  // Return primitive values as is
  return data;
}

/**
 * Compresses JSON data for storage or transmission
 * @param data The JSON data to compress
 * @returns Compressed string representation of the data
 */
export function compressJsonData(data: any): string {
  // First remove redundancies
  const optimized = removeRedundancies(data);
  
  // For array data, use chart data compression technique
  if (Array.isArray(optimized)) {
    return compressChartData(optimized);
  }
  
  // For regular objects, use standard JSON stringification
  return JSON.stringify(optimized);
}

/**
 * Decompresses previously compressed JSON data
 * @param compressedData The compressed data string
 * @returns The original decompressed data
 */
export function decompressJsonData(compressedData: string): any {
  if (!compressedData) return null;
  
  try {
    // Try to parse as regular JSON first
    const parsed = JSON.parse(compressedData);
    
    // Check if it's compressed chart data format
    if (parsed && typeof parsed === 'object' && 'k' in parsed && 'r' in parsed) {
      return decompressChartData(compressedData);
    }
    
    return parsed;
  } catch (error) {
    console.error('Error decompressing JSON data:', error);
    return null;
  }
}

/**
 * Measures the compression ratio achieved by the optimization
 * @param original The original data
 * @param compressed The compressed data
 * @returns Compression ratio as a percentage
 */
export function measureCompressionRatio(original: any, compressed: string): number {
  const originalSize = JSON.stringify(original).length;
  const compressedSize = compressed.length;
  
  return Math.round((1 - (compressedSize / originalSize)) * 100);
}