# Performance Monitoring and Optimization Guide

## Overview
This document outlines strategies for monitoring and optimizing data loading performance in the Energy application. It covers benchmarking, profiling, optimization techniques, and implementation of caching strategies.

## Measuring Data Loading Performance

### Benchmarking JSON Loading Times

```typescript
// Example: Benchmarking data loading performance
import { performance } from 'perf_hooks';
import { loadTariffs } from '../utils/tariffLoader';
import { loadSimulationParams } from '../utils/simulationParamsLoader';
import { loadEmissionsData } from '../utils/emissionsLoader';

// Function to benchmark data loading
function benchmarkLoading(loaderFn: Function, name: string, iterations: number = 100) {
  const times: number[] = [];
  
  // Warm-up call
  loaderFn();
  
  // Benchmark multiple iterations
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    loaderFn();
    const end = performance.now();
    times.push(end - start);
  }
  
  // Calculate statistics
  const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  console.log(`${name} Performance (${iterations} iterations):`);
  console.log(`  Average: ${avg.toFixed(2)}ms`);
  console.log(`  Min: ${min.toFixed(2)}ms`);
  console.log(`  Max: ${max.toFixed(2)}ms`);
  
  return { avg, min, max, times };
}

// Benchmark all loaders
const tariffStats = benchmarkLoading(loadTariffs, 'Tariff Loader');
const paramsStats = benchmarkLoading(loadSimulationParams, 'Simulation Parameters Loader');
const emissionsStats = benchmarkLoading(loadEmissionsData, 'Emissions Loader');

// Compare with hardcoded data (example)
const hardcodedTariffStats = benchmarkLoading(
  () => [
    { name: 'Tarifa Base', type: 'fixed', basePrice: 3.45, energyPrice: 0.14, powerPrice: 44.44 },
    // More hardcoded tariffs...
  ],
  'Hardcoded Tariffs'
);

console.log('Performance comparison:');
console.log(`  JSON vs Hardcoded ratio: ${(tariffStats.avg / hardcodedTariffStats.avg).toFixed(2)}x`);
```

### Profiling Memory Usage

```typescript
// Example: Profiling memory usage during data loading
import { loadTariffs } from '../utils/tariffLoader';

// Function to measure memory usage
function measureMemoryUsage(fn: Function) {
  // Force garbage collection if available (Node.js with --expose-gc flag)
  if (global.gc) {
    global.gc();
  }
  
  const memBefore = process.memoryUsage();
  const result = fn();
  const memAfter = process.memoryUsage();
  
  const memoryDiff = {
    rss: memAfter.rss - memBefore.rss,
    heapTotal: memAfter.heapTotal - memBefore.heapTotal,
    heapUsed: memAfter.heapUsed - memBefore.heapUsed,
    external: memAfter.external - memBefore.external,
  };
  
  console.log('Memory usage (bytes):');
  console.log(`  RSS: ${memoryDiff.rss}`);
  console.log(`  Heap total: ${memoryDiff.heapTotal}`);
  console.log(`  Heap used: ${memoryDiff.heapUsed}`);
  console.log(`  External: ${memoryDiff.external}`);
  
  return { result, memoryDiff };
}

// Measure memory usage for tariff loading
const { result: tariffs, memoryDiff } = measureMemoryUsage(loadTariffs);
console.log(`Loaded ${tariffs.length} tariffs using ${memoryDiff.heapUsed} bytes of heap memory`);
```

### Identifying Bottlenecks

```typescript
// Example: Identifying bottlenecks in validation process
import { performance } from 'perf_hooks';
import { z } from 'zod';
import { tariffSchema } from '../schemas/tariffSchema';
import tariffData from '../data/tariffs.json';

// Function to profile validation steps
function profileValidation() {
  console.log('Profiling validation process:');
  
  // Measure JSON parsing (if needed)
  const startParse = performance.now();
  const parsedData = JSON.parse(JSON.stringify(tariffData)); // Simulate parsing
  const endParse = performance.now();
  console.log(`  JSON parsing: ${(endParse - startParse).toFixed(2)}ms`);
  
  // Measure schema validation
  const startValidation = performance.now();
  const tariffsFileSchema = z.object({
    tariffs: z.array(tariffSchema)
  });
  const validationResult = tariffsFileSchema.safeParse(tariffData);
  const endValidation = performance.now();
  console.log(`  Schema validation: ${(endValidation - startValidation).toFixed(2)}ms`);
  
  // Measure data transformation (if any)
  const startTransform = performance.now();
  if (validationResult.success) {
    const tariffs = validationResult.data.tariffs;
    // Any additional transformations would go here
  }
  const endTransform = performance.now();
  console.log(`  Data transformation: ${(endTransform - startTransform).toFixed(2)}ms`);
  
  return {
    parseTime: endParse - startParse,
    validationTime: endValidation - startValidation,
    transformTime: endTransform - startTransform,
    totalTime: endTransform - startParse
  };
}

const profile = profileValidation();
console.log(`Total processing time: ${profile.totalTime.toFixed(2)}ms`);
```

## Optimizing JSON File Sizes

### Data Compression Techniques

```typescript
// Example: Using data compression utilities
import { compressChartData, decompressChartData } from '../utils/dataCompression';

// Original large dataset
const originalData = [
  { date: '2023-01-01', value: 100, category: 'A', region: 'North', subCategory: 'X' },
  { date: '2023-01-02', value: 150, category: 'A', region: 'North', subCategory: 'X' },
  // ... hundreds more entries
];

// Compress the data
const compressed = compressChartData(originalData);
console.log(`Original size: ${JSON.stringify(originalData).length} bytes`);
console.log(`Compressed size: ${compressed.length} bytes`);
console.log(`Compression ratio: ${(compressed.length / JSON.stringify(originalData).length * 100).toFixed(2)}%`);

// Decompress when needed
const decompressed = decompressChartData(compressed);
console.log(`Decompressed entries: ${decompressed.length}`);
```

### Removing Redundant Data Structures

```typescript
// Example: Optimizing JSON structure by removing redundancy

// Before optimization - redundant data
const redundantData = {
  "tariffs": [
    {
      "name": "Tarifa Base",
      "type": "fixed",
      "basePrice": 3.45,
      "energyPrice": 0.14,
      "powerPrice": 44.44,
      "region": "Spain",
      "provider": "Energy Co",
      "description": "Basic fixed rate tariff for residential customers",
      "updatedAt": "2023-06-15T10:00:00Z"
    },
    // More tariffs with the same redundant fields...
  ]
};

// After optimization - common data extracted
const optimizedData = {
  "metadata": {
    "region": "Spain",
    "provider": "Energy Co",
    "updatedAt": "2023-06-15T10:00:00Z"
  },
  "tariffs": [
    {
      "name": "Tarifa Base",
      "type": "fixed",
      "basePrice": 3.45,
      "energyPrice": 0.14,
      "powerPrice": 44.44,
      "description": "Basic fixed rate tariff for residential customers"
    },
    // More tariffs without redundant fields...
  ]
};

// When loading, merge the metadata with each tariff
function loadOptimizedTariffs() {
  const data = optimizedData;
  return data.tariffs.map(tariff => ({
    ...tariff,
    ...data.metadata
  }));
}
```

### Implementing Lazy Loading

```typescript
// Example: Lazy loading for large datasets
import { useState, useEffect } from 'react';

// Lazy loader function
function lazyLoadEmissionsData() {
  // Return a promise that resolves with the data
  return new Promise((resolve) => {
    // Use setTimeout to simulate async loading
    setTimeout(() => {
      import('../data/emissions.json')
        .then(module => {
          resolve(module.default);
        });
    }, 0);
  });
}

// React component using lazy loading
function EmissionsDataDisplay() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    lazyLoadEmissionsData()
      .then(emissionsData => {
        setData(emissionsData);
        setLoading(false);
      });
  }, []);
  
  if (loading) {
    return <div>Loading emissions data...</div>;
  }
  
  return (
    <div>
      <h2>Emissions Data</h2>
      {/* Render data here */}
    </div>
  );
}
```

## Implementing Caching Strategies

### Validation Result Caching

```typescript
// Example: Caching validation results
import { z } from 'zod';
import { tariffSchema, TariffData } from '../schemas/tariffSchema';
import tariffData from '../data/tariffs.json';

// Simple in-memory cache
const validationCache = new Map();

// Schema for validating the entire tariffs JSON file
const tariffsFileSchema = z.object({
  tariffs: z.array(tariffSchema)
});

// Loads and validates tariff data with caching
export function loadTariffsWithCache(): TariffData[] {
  // Generate a cache key (could be based on file path, timestamp, etc.)
  const cacheKey = 'tariffs-' + (tariffData.updatedAt || Date.now());
  
  // Check if we have a cached result
  if (validationCache.has(cacheKey)) {
    console.log('Using cached validation result');
    return validationCache.get(cacheKey);
  }
  
  try {
    // Validate the entire tariffs file against the schema
    const validationResult = tariffsFileSchema.safeParse(tariffData);
    
    if (!validationResult.success) {
      // If validation fails, throw an error with the validation issues
      const errorMessage = `Tariff data validation failed: ${validationResult.error.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // Cache the validated result
    const validatedTariffs = validationResult.data.tariffs;
    validationCache.set(cacheKey, validatedTariffs);
    
    // Return the validated tariffs array
    return validatedTariffs;
  } catch (error) {
    // Handle any unexpected errors during loading or validation
    const errorMessage = error instanceof Error 
      ? `Failed to load tariff data: ${error.message}` 
      : 'Failed to load tariff data: Unknown error';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}
```

### Local Storage Caching

```typescript
// Example: Using localStorage for persistent caching

// Function to cache data in localStorage
function cacheData(key: string, data: any, expirationMinutes: number = 60) {
  const now = new Date();
  const item = {
    value: data,
    expiry: now.getTime() + (expirationMinutes * 60 * 1000),
  };
  localStorage.setItem(key, JSON.stringify(item));
}

// Function to get cached data
function getCachedData(key: string) {
  const itemStr = localStorage.getItem(key);
  
  // If no item exists, return null
  if (!itemStr) {
    return null;
  }
  
  const item = JSON.parse(itemStr);
  const now = new Date();
  
  // Check if the item is expired
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  
  return item.value;
}

// Example usage in a loader function
export function loadTariffsWithLocalStorage(): TariffData[] {
  // Try to get cached data first
  const cachedTariffs = getCachedData('cached_tariffs');
  
  if (cachedTariffs) {
    console.log('Using cached tariffs from localStorage');
    return cachedTariffs;
  }
  
  // If no cache or expired, load and validate from JSON
  try {
    const tariffs = loadTariffs();
    
    // Cache the result for future use
    cacheData('cached_tariffs', tariffs, 60); // Cache for 60 minutes
    
    return tariffs;
  } catch (error) {
    console.error('Failed to load tariffs:', error);
    throw error;
  }
}
```

## Performance Monitoring Dashboard

### Creating a Monitoring Component

```typescript
// Example: Simple performance monitoring component
import React, { useState, useEffect } from 'react';
import { loadTariffs } from '../utils/tariffLoader';
im