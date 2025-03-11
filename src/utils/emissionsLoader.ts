import { z } from 'zod';
import { emissionsSchema, EmissionsData } from '../schemas/emissionsSchema';
import emissionsData from '../data/emissions.json';

/**
 * Type definition for the emissions JSON file structure
 */
export type EmissionsFile = EmissionsData;

/**
 * Loads and validates emissions data from the JSON file
 * @returns Validated emissions data object
 * @throws Error if the data fails validation
 */
export function loadEmissionsData(): EmissionsData {
  try {
    // Validate the emissions data against the schema
    const validationResult = emissionsSchema.safeParse(emissionsData);
    
    if (!validationResult.success) {
      // If validation fails, throw an error with the validation issues
      const errorMessage = `Emissions data validation failed: ${validationResult.error.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // Return the validated emissions data
    return validationResult.data;
  } catch (error) {
    // Handle any unexpected errors during loading or validation
    const errorMessage = error instanceof Error 
      ? `Failed to load emissions data: ${error.message}` 
      : 'Failed to load emissions data: Unknown error';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Gets a specific energy source by name
 * @param name The name of the energy source to find
 * @returns The energy source object or undefined if not found
 */
export function getEnergySourceByName(name: string) {
  const data = loadEmissionsData();
  return data.energySources.find(source => source.name === name);
}

/**
 * Gets all energy sources of a specific type
 * @param type The type of energy sources to filter by
 * @returns An array of energy source objects of the specified type
 */
export function getEnergySourcesByType(type: 'renewable' | 'fossil' | 'nuclear' | 'hybrid') {
  const data = loadEmissionsData();
  return data.energySources.filter(source => source.type === type);
}

/**
 * Gets a specific conversion factor by units
 * @param fromUnit The source unit
 * @param toUnit The target unit
 * @returns The conversion factor object or undefined if not found
 */
export function getConversionFactor(fromUnit: string, toUnit: string) {
  const data = loadEmissionsData();
  return data.conversionFactors.find(
    factor => factor.fromUnit === fromUnit && factor.toUnit === toUnit
  );
}

/**
 * Gets all conversion factors for a specific context
 * @param context The context to filter by (energy, emissions, power)
 * @returns An array of conversion factor objects for the specified context
 */
export function getConversionFactorsByContext(context: 'energy' | 'emissions' | 'power') {
  const data = loadEmissionsData();
  return data.conversionFactors.filter(factor => factor.context === context);
}