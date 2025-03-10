import { z } from 'zod';
import { tariffSchema, TariffData } from '../schemas/tariffSchema';
import tariffData from '../data/tariffs.json';

/**
 * Type definition for the tariffs JSON file structure
 */
export type TariffsFile = {
  tariffs: TariffData[];
};

/**
 * Schema for validating the entire tariffs JSON file
 */
const tariffsFileSchema = z.object({
  tariffs: z.array(tariffSchema)
});

/**
 * Loads and validates tariff data from the JSON file
 * @returns An array of validated tariff data objects
 * @throws Error if the data fails validation
 */
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

/**
 * Gets a specific tariff by name
 * @param name The name of the tariff to find
 * @returns The tariff data object or undefined if not found
 */
export function getTariffByName(name: string): TariffData | undefined {
  const tariffs = loadTariffs();
  return tariffs.find(tariff => tariff.name === name);
}

/**
 * Gets all tariffs of a specific type
 * @param type The type of tariffs to filter by ('fixed' or 'variable')
 * @returns An array of tariff data objects of the specified type
 */
export function getTariffsByType(type: 'fixed' | 'variable'): TariffData[] {
  const tariffs = loadTariffs();
  return tariffs.filter(tariff => tariff.type === type);
}