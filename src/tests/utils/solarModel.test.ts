import { describe, expect, it } from 'vitest';
import { defaultEquipment, simulateSolar, SolarInput } from '../../modules/solar/model';
const example = (): SolarInput => ({ monthlyLoadKWh: 250, peakSunHours: 5, tariffCOP: 454, investmentCOP: 9500000, cellTemperatureC: 25, otherLossesPct: 14, daytimeLoadPct: 50, annualMaintenanceCOP: 0, equipment: defaultEquipment() });
describe('solar physical and financial model', () => {
  it('matches rated-power yield, module area and sizing by hand', () => {
    const result = simulateSolar(example());
    expect(result.productionKWh).toBeCloseTo(247.68, 8);
    expect(result.installedKWp).toBe(2);
    expect(result.areaM2).toBe(10);
    expect(result.requiredKWp).toBeCloseTo(2.01873385);
    expect(result.suggestedPanels).toBe(6);
    expect(result.selfConsumedKWh).toBeCloseTo(112.606158);
    expect(result.annualSavingsCOP).toBeCloseTo(result.selfConsumedKWh * 12 * 454);
    const input = example(); input.equipment.panel.efficiencyPct = 25;
    expect(simulateSolar(input).productionKWh).toBeCloseTo(result.productionKWh);
    expect(simulateSolar(input).areaM2).toBe(8);
    input.cellTemperatureC = 45;
    expect(simulateSolar(input).productionKWh).toBeCloseTo(230.3424);
  });
  it('clips generation at inverter AC power', () => {
    const input = example(); const baseline = simulateSolar(input);
    input.equipment.inverter.acKW = 0.3;
    const clipped = simulateSolar(input);
    expect(clipped.productionKWh).toBeLessThan(baseline.productionKWh);
    expect(clipped.clippingKWh).toBeGreaterThan(0);
    expect(clipped.productionKWh + clipped.clippingKWh).toBeCloseTo(baseline.productionKWh);
  });
  it('conserves load, solar and stored energy across battery sizes and efficiencies', () => {
    for (const capacity of [0.1, 5, 100]) for (const efficiency of [50, 81, 100]) {
      const input = example(); Object.assign(input.equipment.battery, { enabled: true, count: 2, nominalKWh: capacity, roundTripEfficiencyPct: efficiency });
      const r = simulateSolar(input);
      expect(r.nominalBatteryKWh).toBe(capacity * 2);
      expect(r.usableBatteryKWh).toBeCloseTo(capacity * 1.6);
      expect(r.selfConsumedKWh + r.gridKWh).toBeCloseTo(input.monthlyLoadKWh, 8);
      expect(r.selfConsumedKWh + r.exportedKWh + r.batteryLossKWh + r.endStoredKWh).toBeCloseTo(r.productionKWh, 8);
      expect(r.dischargedKWh + r.batteryLossKWh + r.endStoredKWh).toBeCloseTo(r.chargedKWh, 8);
      expect(r.endStoredKWh).toBeGreaterThanOrEqual(0);
      expect(r.endStoredKWh).toBeLessThanOrEqual(r.usableBatteryKWh + 1e-10);
      expect(r.selfConsumedKWh).toBeLessThanOrEqual(input.monthlyLoadKWh + 1e-10);
      expect(r.dischargedKWh).toBeLessThanOrEqual(r.chargedKWh + 1e-10);
    }
  });
  it('cannot generate battery energy from an empty bank without solar', () => {
    const input = example(); input.equipment.battery.enabled = true; input.equipment.panel.count = 0;
    const result = simulateSolar(input);
    expect(result.dischargedKWh).toBe(0); expect(result.gridKWh).toBeCloseTo(250); expect(result.paybackYears).toBeNull();
  });
  it('handles disabled invalid battery drafts and zero demand/tariff', () => {
    const input = example(); input.equipment.battery.depthOfDischargePct = NaN;
    expect(simulateSolar(input).usableBatteryKWh).toBe(0);
    input.monthlyLoadKWh = 0; expect(simulateSolar(input).paybackYears).toBeNull();
    input.monthlyLoadKWh = 250; input.tariffCOP = 0; expect(simulateSolar(input).paybackYears).toBeNull();
    input.tariffCOP = 454; input.annualMaintenanceCOP = 1e9; expect(simulateSolar(input).paybackYears).toBeNull();
  });
  it('rejects nonfinite, fractional quantities and invalid specs', () => {
    for (const value of [NaN, Infinity, -1, Number.MAX_VALUE]) { const input = example(); input.tariffCOP = value; expect(() => simulateSolar(input)).toThrow(); }
    const input = example(); input.equipment.panel.count = 1.5; expect(() => simulateSolar(input)).toThrow();
    input.equipment.panel.count = 5; input.equipment.battery.enabled = true; input.equipment.battery.roundTripEfficiencyPct = 101; expect(() => simulateSolar(input)).toThrow();
  });
});
