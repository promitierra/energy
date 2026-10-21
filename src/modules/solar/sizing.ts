import { defaultEquipment, simulateSolar, SolarInput, validateInput } from './model';

/** Scenario targets, not an electrical design or a weather reliability guarantee. */
export function suggestSizing(input: SolarInput) {
  const errors = validateInput(input);
  if (errors.length) throw new Error(errors.join(' '));
  const offGrid = input.projectType === 'off-grid';
  const { panel, inverter } = input.equipment;
  // A disabled/cleared battery draft must not poison the proposal.
  const draft = input.equipment.battery;
  const battery = [draft.nominalKWh, draft.depthOfDischargePct, draft.roundTripEfficiencyPct, draft.chargeKW, draft.dischargeKW]
    .every(value => Number.isFinite(value) && value > 0 && value <= 100000) && draft.nominalKWh >= 0.001 && draft.chargeKW >= 0.001 && draft.dischargeKW >= 0.001 && draft.depthOfDischargePct >= 0.01 && draft.depthOfDischargePct <= 100 && draft.roundTripEfficiencyPct >= 0.01 && draft.roundTripEfficiencyPct <= 100 ? draft : defaultEquipment().battery;
  const daily = input.monthlyLoadKWh / 30;
  const night = daily * (1 - input.daytimeLoadPct / 100);
  const profilePeak = daily / 12 * Math.max(input.daytimeLoadPct / 100, 1 - input.daytimeLoadPct / 100);
  const loadPeakKW = offGrid ? Math.max(input.peakLoadKW ?? 0, profilePeak) : profilePeak;
  const eta = Math.sqrt(battery.roundTripEfficiencyPct / 100);
  const autonomyEnergyKWh = offGrid ? daily * (input.autonomyDays ?? 1) : night;
  const energyCount = Math.ceil(autonomyEnergyKWh / (battery.nominalKWh * battery.depthOfDischargePct / 100 * eta));
  const powerCount = Math.ceil((offGrid ? loadPeakKW : night / 12) / battery.dischargeKW);
  const chargeCount = Math.ceil(night / (battery.roundTripEfficiencyPct / 100 * 12 * battery.chargeKW));
  const nightShiftBatteries = Math.max(energyCount, powerCount, chargeCount);
  const minimumBatteries = offGrid || draft.enabled ? nightShiftBatteries : 0;
  const thermal = Math.max(0, 1 + panel.temperatureCoefficientPct / 100 * (input.cellTemperatureC - 25));
  const factor = thermal * (1 - input.otherLossesPct / 100) * inverter.efficiencyPct / 100;
  const weights = Array.from({ length: 12 }, (_, j) => Math.sin(Math.PI * (j + 0.5) / 12));
  const peakRatio = input.peakSunHours * Math.max(...weights) / weights.reduce((a, b) => a + b, 0);
  const inverterFor = (count: number) => Math.max(offGrid ? loadPeakKW : 0, count * panel.ratedWp / 1000 * factor * peakRatio);
  const candidate = (count: number): SolarInput => ({ ...input, equipment: {
    panel: { ...panel, count }, inverter: { ...inverter, acKW: Math.max(0.001, inverterFor(count)) },
    battery: { ...battery, enabled: minimumBatteries > 0, count: Math.max(1, minimumBatteries) }
  } });
  let minimumPanels: number | null = daily === 0 ? 0 : factor > 0 ? Math.ceil(input.monthlyLoadKWh / (30 * input.peakSunHours * factor * panel.ratedWp / 1000)) : null;
  const maxPanels = Math.min(100000, factor * peakRatio > 0 ? Math.floor(100000 / (panel.ratedWp / 1000 * factor * peakRatio)) : 100000);
  let feasible = minimumPanels !== null && minimumPanels <= maxPanels && minimumBatteries <= 100000;
  // Search the integer panel minimum with the proposed bank and unclipped inverter.
  // Day 30 excludes the explicitly empty startup, but the actual simulation never does.
  if (offGrid && feasible && daily > 0) {
    let lo = 0, hi = Math.max(1, minimumPanels!);
    const meets = (count: number) => simulateSolar(candidate(count)).lastDayUnmetKWh <= 1e-8;
    while (hi < maxPanels && !meets(hi)) hi = Math.min(maxPanels, hi * 2);
    if (!meets(hi)) { feasible = false; minimumPanels = null; }
    else {
      while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (meets(mid)) hi = mid; else lo = mid + 1; }
      minimumPanels = lo;
    }
  }
  if (!feasible) minimumPanels = null;
  const minimumInverterKW = minimumPanels === null ? null : Math.ceil(inverterFor(Math.max(panel.count, minimumPanels)) * 100) / 100;
  return {
    minimumPanels, minimumBatteries, nightShiftBatteries, minimumInverterKW, loadPeakKW,
    autonomyEnergyKWh, batteryUnitKWh: battery.nominalKWh,
    batteryDischargeKW: offGrid ? loadPeakKW : night / 12,
    feasible, candidate: minimumPanels === null ? null : candidate(minimumPanels),
    batteryUsesExample: battery !== draft
  };
}
