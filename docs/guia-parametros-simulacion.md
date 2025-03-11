# Simulation Parameters Loading Guide

## Overview
This guide explains how to use the simulation parameters loading mechanism and how to migrate hardcoded configuration data to the JSON format.

## Using the Simulation Parameters Loader

### Basic Usage
The simulation parameters loader provides a simple function to access configuration data from the JSON file:

```typescript
import { loadSimulationParams } from '../utils/simulationParamsLoader';

// Load all simulation parameters
const params = loadSimulationParams();

// Access specific parameters
const initialInvestment = params.initialInvestment;
const systemLifespan = params.systemLifespan;
const incentives = params.incentives;
```

### Error Handling
The simulation parameters loader includes robust error handling:

```typescript
try {
  const params = loadSimulationParams();
  // Use parameters for simulation
} catch (error) {
  console.error('Failed to load simulation parameters:', error);
  // Implement fallback mechanism or show user-friendly error
}
```

## Migrating Hardcoded Data to JSON

### Before Migration (Hardcoded)

```typescript
// Old approach with hardcoded parameters
const SIMULATION_PARAMS = {
  initialInvestment: 10000,
  systemLifespan: 25,
  maintenanceCost: 200,
  annualDegradation: 0.5,
  energyPriceInflation: 2.5,
  financingRate: 4.5,
  financingYears: 10
};

// Old function to get parameters
function getSimulationParams() {
  return SIMULATION_PARAMS;
}

// Old function to calculate ROI
function calculateROI(consumption) {
  const params = getSimulationParams();
  // Use params.initialInvestment, params.systemLifespan, etc.
}
```

### After Migration (Using JSON)

1. First, ensure your data is in the correct format in `src/data/simulationParams.json`:

```json
{
  "initialInvestment": 10000,
  "systemLifespan": 25,
  "maintenanceCost": 200,
  "annualDegradation": 0.5,
  "energyPriceInflation": 2.5,
  "financingRate": 4.5,
  "financingYears": 10,
  "taxRate": 21,
  "incentives": [
    {
      "name": "Solar Tax Credit",
      "type": "taxCredit",
      "amount": 3000,
      "maxLimit": 5000,
      "expirationDate": "2025-12-31T23:59:59Z"
    }
  ],
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

2. Then, replace hardcoded data access with loader functions:

```typescript
// New approach using the loader
import { loadSimulationParams } from '../utils/simulationParamsLoader';

// Calculate ROI with loaded parameters
function calculateROI(consumption) {
  const params = loadSimulationParams();
  // Use params.initialInvestment, params.systemLifespan, etc.
}
```

## Schema Validation

The simulation parameters loader automatically validates all data against the schema defined in `simulationParamsSchema.ts`. This ensures that:

- All required fields are present
- Field types are correct
- Values are within acceptable ranges

If validation fails, the loader will throw an error with details about the validation failure.

## Best Practices

1. **Always use the loader function** instead of importing the JSON directly
2. **Implement proper error handling** to gracefully handle validation failures
3. **Keep the `updatedAt` field current** when modifying parameter data
4. **Run tests after modifying data** to ensure everything still works
5. **Use the schema as documentation** for required fields and constraints

## Troubleshooting

### Common Validation Errors

- **Missing required field**: Ensure all required parameters are present (initialInvestment, systemLifespan, etc.)
- **Invalid data type**: Check that all values have the correct type (numbers for costs, integers for years)
- **Out of range values**: Ensure percentage values are within their allowed ranges
- **Invalid incentive structure**: Verify that incentives follow the required structure with valid types

### Performance Considerations

The loader validates data on each call, which may impact performance in performance-critical code paths. Consider implementing a caching mechanism if you need to access simulation parameters frequently.