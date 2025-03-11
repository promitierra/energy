import { simulationParamsSchema, SimulationParams } from '../schemas/simulationParamsSchema';
import simulationParamsData from '../data/simulationParams.json';

/**
 * Loads simulation parameters from the JSON file and validates them against the schema
 * @returns Validated simulation parameters
 * @throws Error if validation fails
 */
export const loadSimulationParams = (): SimulationParams => {
  try {
    // Parse and validate the simulation parameters
    const result = simulationParamsSchema.safeParse(simulationParamsData);
    
    if (!result.success) {
      // If validation fails, throw an error with details
      const formattedError = result.error.format();
      throw new Error(`Invalid simulation parameters: ${JSON.stringify(formattedError)}`);
    }
    
    return result.data;
  } catch (error) {
    console.error('Failed to load simulation parameters:', error);
    throw error;
  }
};