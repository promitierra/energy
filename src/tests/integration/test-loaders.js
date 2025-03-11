// Simple script to test data loaders
const { loadTariffs, getTariffByName } = require('../../utils/tariffLoader');
const { loadSimulationParams } = require('../../utils/simulationParamsLoader');
const { loadEmissionsData, getEnergySourceByName } = require('../../utils/emissionsLoader');

console.log('Testing data loaders...');

try {
  // Test tariff loader
  console.log('Loading tariffs...');
  const tariffs = loadTariffs();
  console.log(`Successfully loaded ${tariffs.length} tariffs`);
  
  // Test simulation params loader
  console.log('\nLoading simulation params...');
  const params = loadSimulationParams();
  console.log('Successfully loaded simulation params:');
  console.log(`- Initial investment: ${params.initialInvestment}`);
  console.log(`- System lifespan: ${params.systemLifespan} years`);
  
  // Test emissions data loader
  console.log('\nLoading emissions data...');
  const emissions = loadEmissionsData();
  console.log(`Successfully loaded ${emissions.energySources.length} energy sources`);
  
  // Test helper functions
  console.log('\nTesting helper functions...');
  const tariffName = tariffs[0].name;
  const tariff = getTariffByName(tariffName);
  console.log(`Found tariff by name: ${tariff ? 'Yes' : 'No'}`);
  
  const sourceName = emissions.energySources[0].name;
  const source = getEnergySourceByName(sourceName);
  console.log(`Found energy source by name: ${source ? 'Yes' : 'No'}`);
  
  console.log('\nAll data loaded successfully!');
} catch (error) {
  console.error('Error loading data:', error);
}