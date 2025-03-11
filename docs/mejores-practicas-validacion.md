# Data Validation Best Practices

## Overview
This document outlines best practices for implementing data validation in the Energy application. It focuses on validation strategies, performance optimization, and error handling for JSON data loading.

## Validation at Data Loading Time

### Why Validate at Loading Time?
Validating data when it's loaded, rather than at runtime, offers several advantages:

1. **Early Error Detection**: Problems are caught before they can affect application behavior
2. **Improved Performance**: Validation happens once, not repeatedly during application execution
3. **Cleaner Component Code**: Components can assume data is valid and focus on rendering
4. **Centralized Validation Logic**: All validation rules are in one place, making them easier to maintain

### Implementation Example

```typescript
// Example: Validation at loading time in tariffLoader.ts
import { z } from 'zod';
import { tariffSchema, TariffData } from '../schemas/tariffSchema';
import tariffData from '../data/tariffs.json';

// Schema for validating the entire tariffs JSON file
const tariffsFileSchema = z.object({
  tariffs: z.array(tariffSchema)
});

// Loads and validates tariff data from the JSON file
export function loadTariffs(): TariffData[] {
  try {
    // Validate the entire tariffs file against the schema
    const validationResult = tariffsFileSchema.safeParse(tariffData);
    
    if (!validationResult.success) {
      // If validation fails, throw an error with the validation issues
      const errorMessage = `Tariff data validation failed: ${validationResult.error.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // Return the validated tariffs array
    return validationResult.data.tariffs;
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

## Caching Validation Results

### Why Cache Validation Results?

1. **Improved Performance**: Avoid redundant validation of the same data
2. **Reduced CPU Usage**: Validation can be CPU-intensive, especially for large datasets
3. **Faster Component Rendering**: Components get validated data more quickly

### Implementation Example

```typescript
// Example: Caching validation results
import { z } from 'zod';
import { tariffSchema, TariffData } from '../schemas/tariffSchema';
import tariffData from '../data/tariffs.json';

// Simple in-memory cache
const validationCache = new Map<string, TariffData[]>();

// Schema for validating the entire tariffs JSON file
const tariffsFileSchema = z.object({
  tariffs: z.array(tariffSchema)
});

// Loads and validates tariff data with caching
export function loadTariffsWithCache(): TariffData[] {
  // Generate a cache key based on the data's updatedAt timestamp
  const cacheKey = `tariffs-${tariffData.updatedAt || 'default'}`;
  
  // Check if we have a cached result
  if (validationCache.has(cacheKey)) {
    return validationCache.get(cacheKey)!;
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

### Cache Invalidation Strategies

1. **Timestamp-Based**: Invalidate cache when data's updatedAt timestamp changes
2. **TTL (Time-to-Live)**: Set an expiration time for cached data
3. **Manual Invalidation**: Provide a function to clear the cache when needed

```typescript
// Example: Cache with TTL
const validationCache = new Map<string, {
  data: any;
  expiry: number;
}>();

function getCachedValidation(key: string) {
  if (!validationCache.has(key)) return null;
  
  const cached = validationCache.get(key)!;
  const now = Date.now();
  
  if (now > cached.expiry) {
    // Cache expired
    validationCache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCachedValidation(key: string, data: any, ttlMinutes: number = 60) {
  validationCache.set(key, {
    data,
    expiry: Date.now() + (ttlMinutes * 60 * 1000)
  });
}
```

## Detailed Error Messages

### Why Provide Detailed Error Messages?

1. **Faster Debugging**: Clear error messages help identify the source of problems
2. **Better User Experience**: User-friendly error messages can be derived from detailed validation errors
3. **Improved Maintainability**: Detailed errors make it easier to fix data issues

### Implementation Example

```typescript
// Example: Providing detailed error messages
import { z } from 'zod';
import { tariffSchema } from '../schemas/tariffSchema';

// Function to format Zod validation errors
function formatZodError(error: z.ZodError) {
  return error.errors.map(err => {
    return {
      path: err.path.join('.'),
      message: err.message,
      code: err.code
    };
  });
}

// Validate tariff data with detailed error reporting
export function validateTariffData(data: unknown) {
  const result = tariffSchema.safeParse(data);
  
  if (!result.success) {
    const formattedErrors = formatZodError(result.error);
    console.error('Validation errors:', formattedErrors);
    
    // Create a user-friendly error message
    const fieldErrors = formattedErrors.map(err => `${err.path}: ${err.message}`).join(', ');
    throw new Error(`Invalid tariff data: ${fieldErrors}`);
  }
  
  return result.data;
}
```

### Error Message Best Practices

1. **Be Specific**: Clearly identify which field failed validation
2. **Provide Context**: Include the expected format or allowed values
3. **Suggest Fixes**: When possible, suggest how to correct the error
4. **Log Details**: Log detailed technical information while showing simplified messages to users

## Validation Performance Optimization

### Strategies for Improving Validation Performance

1. **Selective Validation**: Only validate fields that are actually used
2. **Incremental Validation**: Validate only what has changed
3. **Asynchronous Validation**: Move validation to a worker thread for large datasets
4. **Schema Optimization**: Simplify schemas where possible

### Implementation Example

```typescript
// Example: Selective validation for performance
import { z } from 'zod';

// Define a minimal schema for performance-critical paths
const minimalTariffSchema = z.object({
  name: z.string(),
  type: z.enum(['fixed', 'variable']),
  basePrice: z.number().positive(),
  energyPrice: z.number().positive()
  // Omit optional fields and complex validations
});

// Use the minimal schema for performance-critical operations
export function quickValidateTariff(tariff: unknown) {
  return minimalTariffSchema.parse(tariff);
}

// Use the full schema for complete validation
export function fullValidateTariff(tariff: unknown) {
  return tariffSchema.parse(tariff);
}
```

## Integration with Components

### React Component Integration

```typescript
// Example: React component with validation error handling
import React, { useState, useEffect } from 'react';
import { loadTariffs } from '../utils/tariffLoader';

function TariffList() {
  const [tariffs, setTariffs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    try {
      const loadedTariffs = loadTariffs();
      setTariffs(loadedTariffs);
      setError(null);
    } catch (err) {
      console.error('Failed to load tariffs:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading tariffs');
      setTariffs([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  if (loading) {
    return <div>Loading tariffs...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Tariffs</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  return (
    <div>
      <h2>Available Tariffs</h2>
      <ul>
        {tariffs.map(tariff => (
          <li key={tariff.name}>{tariff.name} - {tariff.basePrice}€</li>
        ))}
      </ul>
    </div>
  );
}
```

## Validation Monitoring

### Tracking Validation Performance

```typescript
// Example: Monitoring validation performance
import { performance } from 'perf_hooks';

// Validation performance metrics
const validationMetrics = {
  count: 0,
  totalTime: 0,
  failures: 0,
  lastRunTime: 0
};

// Wrapper function to monitor validation performance
export function monitoredValidation<T>(schema: z.ZodType<T>, data: unknown): T {
  validationMetrics.count++;
  
  const start = performance.now();
  try {
    const result = schema.parse(data);
    const end = performance.now();
    
    validationMetrics.totalTime += (end - start);
    validationMetrics.lastRunTime = end - start;
    
    return result;
  } catch (error) {
    validationMetrics.failures++;
    throw error;
  }
}

// Function to get validation performance report
export function getValidationMetrics() {
  return {
    ...validationMetrics,
    averageTime: validationMetrics.count > 0 
      ? validationMetrics.totalTime / validationMetrics.count 
      : 0,
    successRate: validationMetrics.count > 0 
      ? ((validationMetrics.count - validationMetrics.failures) / validationMetrics.count) * 100 
      : 0
  };
}
```

## Conclusion

Implementing these validation best practices will help ensure data integrity while maintaining good performance in the Energy application. By validating at data loading time, caching validation results, and providing detailed error messages, you can create a more robust and maintainable application.

## Additional Resources

- [Zod Documentation](https://github.com/colinhacks/zod)
- [API Documentation](./api-documentation.md)
- [Performance Optimization Guide](./performance-optimization.md)
- [Testing Strategy](./testing-strategy.md)