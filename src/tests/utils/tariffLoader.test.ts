import { loadTariffs, getTariffByName, getTariffsByType } from '../../utils/tariffLoader';
import * as tariffData from '../../data/tariffs.json';

// Mock the tariff data import
jest.mock('../../data/tariffs.json', () => ({
  tariffs: [
    {
      name: 'Tarifa Test Fija',
      type: 'fixed',
      basePrice: 3.45,
      energyPrice: 0.14,
      powerPrice: 44.44,
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      name: 'Tarifa Test Variable',
      type: 'variable',
      basePrice: 3.45,
      energyPrice: 0.12,
      powerPrice: 44.44,
      timeRanges: [
        {
          startHour: 0,
          endHour: 7,
          multiplier: 0.8
        },
        {
          startHour: 8,
          endHour: 17,
          multiplier: 1.2
        },
        {
          startHour: 18,
          endHour: 23,
          multiplier: 1.5
        }
      ],
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]
}));

describe('Tariff Loader', () => {
  describe('loadTariffs', () => {
    it('should load and validate tariff data successfully', () => {
      const tariffs = loadTariffs();
      expect(tariffs).toHaveLength(2);
      expect(tariffs[0].name).toBe('Tarifa Test Fija');
      expect(tariffs[1].name).toBe('Tarifa Test Variable');
    });

    it('should throw an error when tariff data is invalid', () => {
      // Override the mock to return invalid data
      jest.resetModules();
      jest.mock('../../data/tariffs.json', () => ({
        tariffs: [
          {
            // Missing required fields
            name: 'Invalid Tariff',
            type: 'fixed'
            // Missing basePrice, energyPrice, and updatedAt
          }
        ]
      }));

      // Reimport the module to use the new mock
      jest.isolateModules(() => {
        const { loadTariffs } = require('../../utils/tariffLoader');
        expect(() => loadTariffs()).toThrow('Tariff data validation failed');
      });
    });
  });

  describe('getTariffByName', () => {
    it('should return the correct tariff when found', () => {
      const tariff = getTariffByName('Tarifa Test Fija');
      expect(tariff).toBeDefined();
      expect(tariff?.type).toBe('fixed');
      expect(tariff?.basePrice).toBe(3.45);
    });

    it('should return undefined when tariff is not found', () => {
      const tariff = getTariffByName('Non-existent Tariff');
      expect(tariff).toBeUndefined();
    });
  });

  describe('getTariffsByType', () => {
    it('should return all fixed tariffs', () => {
      const fixedTariffs = getTariffsByType('fixed');
      expect(fixedTariffs).toHaveLength(1);
      expect(fixedTariffs[0].name).toBe('Tarifa Test Fija');
    });

    it('should return all variable tariffs', () => {
      const variableTariffs = getTariffsByType('variable');
      expect(variableTariffs).toHaveLength(1);
      expect(variableTariffs[0].name).toBe('Tarifa Test Variable');
      expect(variableTariffs[0].timeRanges).toHaveLength(3);
    });

    it('should return an empty array when no tariffs of the specified type exist', () => {
      // Override the mock to return only fixed tariffs
      jest.resetModules();
      jest.mock('../../data/tariffs.json', () => ({
        tariffs: [
          {
            name: 'Tarifa Test Fija 1',
            type: 'fixed',
            basePrice: 3.45,
            energyPrice: 0.14,
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            name: 'Tarifa Test Fija 2',
            type: 'fixed',
            basePrice: 4.45,
            energyPrice: 0.15,
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ]
      }));

      // Reimport the module to use the new mock
      jest.isolateModules(() => {
        const { getTariffsByType } = require('../../utils/tariffLoader');
        const variableTariffs = getTariffsByType('variable');
        expect(variableTariffs).toHaveLength(0);
      });
    });
  });
});