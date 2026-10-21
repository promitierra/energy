import { describe, expect, it } from 'vitest';
import { defaultEquipment, simulateSolar, SolarInput } from '../../modules/solar/model';
import { suggestSizing } from '../../modules/solar/sizing';
const input = (): SolarInput => ({ projectType: 'off-grid', autonomyDays: 1, peakLoadKW: 3, monthlyLoadKWh: 250, peakSunHours: 5, tariffCOP: 454, investmentCOP: 9500000, cellTemperatureC: 25, otherLossesPct: 14, daytimeLoadPct: 50, annualMaintenanceCOP: 0, equipment: defaultEquipment() });
describe('project type and equipment recommendations', () => {
  it('routes deficits and surplus by project type without inventing off-grid savings', () => {
    const off = simulateSolar(input()); const on = simulateSolar({ ...input(), projectType: 'on-grid' });
    expect(off.gridKWh).toBe(0); expect(off.exportedKWh).toBe(0);
    expect(off.unmetKWh).toBeCloseTo(on.gridKWh); expect(off.curtailedKWh).toBeCloseTo(on.exportedKWh);
    expect(off.selfConsumedKWh + off.unmetKWh).toBeCloseTo(250);
    expect(off.annualSavingsCOP).toBe(0); expect(off.paybackYears).toBeNull();
  });
  it('limits combined PV and battery output at the off-grid inverter', () => {
    const i = input(); i.equipment.panel.count = 20; i.equipment.inverter.acKW = 0.1; i.equipment.battery.enabled = true;
    const r = simulateSolar(i);
    expect(r.selfConsumedKWh).toBeLessThanOrEqual(0.1 * 720 + 1e-8);
    for (const h of r.hourly) expect(h.load - h.unmet).toBeLessThanOrEqual(0.1 + 1e-8);
    expect(r.productionKWh).toBeCloseTo(r.selfConsumedKWh + r.curtailedKWh + r.batteryLossKWh + r.endStoredKWh, 8);
  });
  it('finds an integer panel minimum for the proposed off-grid bank and inverter', () => {
    const i = input(), s = suggestSizing(i);
    expect(s.feasible).toBe(true); expect(s.minimumBatteries).toBe(3); expect(s.minimumInverterKW).toBeGreaterThanOrEqual(3);
    const c = s.candidate!;
    expect(simulateSolar(c).lastDayUnmetKWh).toBeLessThan(1e-8);
    expect(simulateSolar(c).unmetKWh).toBeGreaterThan(0); // empty startup remains disclosed
    expect(simulateSolar({ ...c, equipment: { ...c.equipment, panel: { ...c.equipment.panel, count: s.minimumPanels! - 1 } } }).lastDayUnmetKWh).toBeGreaterThan(1e-8);
    const battery = c.equipment.battery;
    expect(s.minimumBatteries * battery.nominalKWh * battery.depthOfDischargePct / 100 * Math.sqrt(battery.roundTripEfficiencyPct / 100)).toBeGreaterThanOrEqual(250 / 30);
  });
  it('increases battery and inverter recommendations for autonomy and peak load', () => {
    const i = input(), base = suggestSizing(i);
    expect(suggestSizing({ ...i, autonomyDays: 3 }).minimumBatteries).toBeGreaterThan(base.minimumBatteries);
    const peak = suggestSizing({ ...i, peakLoadKW: 10 });
    expect(peak.minimumBatteries).toBeGreaterThanOrEqual(5); expect(peak.minimumInverterKW).toBeGreaterThanOrEqual(10);
  });
  it('keeps on-grid storage optional and compares a consistent energy target', () => {
    const i = { ...input(), projectType: 'on-grid' as const }; const s = suggestSizing(i);
    expect(s.minimumPanels).toBe(6); expect(s.minimumBatteries).toBe(0); expect(s.nightShiftBatteries).toBe(2);
    i.equipment.battery.enabled = true; expect(suggestSizing(i).minimumBatteries).toBe(2);
    i.equipment.panel.count = 20; expect(suggestSizing(i).minimumInverterKW).toBeGreaterThan(s.minimumInverterKW!);
  });
  it('handles zero demand, invalid project settings and impossible charging', () => {
    expect(suggestSizing({ ...input(), monthlyLoadKWh: 0, peakLoadKW: 0 }).minimumPanels).toBe(0);
    expect(() => simulateSolar({ ...input(), autonomyDays: 0 })).toThrow();
    const i = input(); i.cellTemperatureC = 100; i.equipment.panel.temperatureCoefficientPct = -2;
    expect(suggestSizing(i).minimumPanels).toBeNull();
    i.equipment.battery.enabled = false; i.equipment.battery.nominalKWh = NaN;
    expect(suggestSizing(i).batteryUsesExample).toBe(true);
  });
});
