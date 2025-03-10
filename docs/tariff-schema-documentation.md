# Tariff Schema Documentation

## Overview
This document outlines the required fields and validations for tariff data in the Energy application. The tariff schema is implemented using Zod for runtime validation and type safety.

## Schema Structure
The tariff schema is defined in `src/schemas/tariffSchema.ts` and includes the following fields:

### Required Fields

| Field | Type | Description | Validation Rules |
|-------|------|-------------|------------------|
| `name` | string | The name of the tariff | Must be a non-empty string |
| `type` | enum | The type of tariff | Must be either 'fixed' or 'variable' |
| `basePrice` | number | The base price component | Must be a positive number |
| `energyPrice` | number | The energy price per kWh | Must be a positive number |
| `updatedAt` | string | Last update timestamp | Must be a valid ISO datetime string |

### Optional Fields

| Field | Type | Description | Validation Rules |
|-------|------|-------------|------------------|
| `powerPrice` | number | The power component price | If provided, must be a positive number |
| `timeRanges` | array | Time-based pricing ranges | Required for variable tariffs, optional for fixed tariffs |

### Time Ranges Structure
When `type` is 'variable', the `timeRanges` field should contain an array of time range objects with the following structure:

| Field | Type | Description | Validation Rules |
|-------|------|-------------|------------------|
| `startHour` | number | Starting hour of the range | Integer between 0 and 23 |
| `endHour` | number | Ending hour of the range | Integer between 0 and 23 |
| `multiplier` | number | Price multiplier for this range | Must be a positive number |

## Validation Rules

1. All tariffs must have a name, type, basePrice, energyPrice, and updatedAt.
2. Variable tariffs should include timeRanges to define different pricing periods.
3. Time ranges should cover the full 24-hour period without gaps or overlaps.
4. All numeric values must be positive.
5. The updatedAt timestamp must be a valid ISO datetime string.

## Sample JSON Structure

```json
{
  "tariffs": [
    {
      "name": "Tarifa Base",
      "type": "fixed",
      "basePrice": 3.45,
      "energyPrice": 0.14,
      "powerPrice": 44.44,
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "name": "Tarifa Variable",
      "type": "variable",
      "basePrice": 3.45,
      "energyPrice": 0.12,
      "powerPrice": 44.44,
      "timeRanges": [
        {
          "startHour": 0,
          "endHour": 7,
          "multiplier": 0.8
        },
        {
          "startHour": 8,
          "endHour": 17,
          "multiplier": 1.2
        },
        {
          "startHour": 18,
          "endHour": 23,
          "multiplier": 1.5
        }
      ],
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Usage Guidelines

1. When adding new tariffs, ensure all required fields are provided.
2. For variable tariffs, ensure timeRanges cover the full 24-hour period.
3. Keep the updatedAt field current when modifying tariff data.
4. Use the tariffSchema for validation before saving or loading tariff data.

## Integration with Application

The tariff data is loaded from `src/data/tariffs.json` and validated against the schema before use in the application. This ensures data integrity and type safety throughout the application lifecycle.