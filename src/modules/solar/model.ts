export interface Feature { name: string; value: string }
export interface Equipment {
  panel: { model: string; count: number; ratedWp: number; efficiencyPct: number; temperatureCoefficientPct: number; features: Feature[] };
  inverter: { model: string; acKW: number; efficiencyPct: number; features: Feature[] };
  battery: { enabled: boolean; model: string; count: number; nominalKWh: number; depthOfDischargePct: number; roundTripEfficiencyPct: number; chargeKW: number; dischargeKW: number; features: Feature[] };
}
export interface SolarInput {
  monthlyLoadKWh: number; peakSunHours: number; tariffCOP: number; investmentCOP: number;
  cellTemperatureC: number; otherLossesPct: number; daytimeLoadPct: number; annualMaintenanceCOP: number;
  equipment: Equipment;
}
export const defaultEquipment = (): Equipment => ({
  panel: { model: 'Panel de ejemplo', count: 5, ratedWp: 400, efficiencyPct: 20, temperatureCoefficientPct: -0.35, features: [] },
  inverter: { model: 'Inversor de ejemplo', acKW: 2, efficiencyPct: 96, features: [] },
  battery: { enabled: false, model: 'Batería de ejemplo', count: 1, nominalKWh: 5, depthOfDischargePct: 80, roundTripEfficiencyPct: 90, chargeKW: 2, dischargeKW: 2, features: [] }
});
export function validateInput(input: SolarInput): string[] {
  const errors: string[] = [];
  const range = (name: string, value: number, min: number, max = Infinity, integer = false) => {
    if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) errors.push(`${name}: valor fuera de rango${integer ? ' (entero requerido)' : ''}.`);
  };
  range('Consumo mensual', input.monthlyLoadKWh, 0, 5000);
  range('Horas solares pico', input.peakSunHours, 0.01, 12);
  range('Tarifa', input.tariffCOP, 0, 1000000);
  range('Inversión', input.investmentCOP, 0, 1e15);
  range('Temperatura de célula', input.cellTemperatureC, -50, 100);
  range('Otras pérdidas', input.otherLossesPct, 0, 99);
  range('Consumo diurno', input.daytimeLoadPct, 0, 100);
  range('Mantenimiento anual', input.annualMaintenanceCOP, 0, 1e15);
  const { panel, inverter, battery } = input.equipment;
  range('Cantidad de paneles', panel.count, 0, 100000, true);
  range('Potencia del panel', panel.ratedWp, 1, 10000);
  range('Eficiencia del panel', panel.efficiencyPct, 0.01, 100);
  range('Coeficiente térmico', panel.temperatureCoefficientPct, -2, 0);
  range('Potencia del inversor', inverter.acKW, 0.001, 100000);
  range('Eficiencia del inversor', inverter.efficiencyPct, 0.01, 100);
  if (battery.enabled) {
    range('Cantidad de baterías', battery.count, 1, 100000, true);
    range('Capacidad de batería', battery.nominalKWh, 0.001, 100000);
    range('Profundidad de descarga', battery.depthOfDischargePct, 0.01, 100);
    range('Eficiencia de ciclo', battery.roundTripEfficiencyPct, 0.01, 100);
    range('Potencia de carga', battery.chargeKW, 0.001, 100000);
    range('Potencia de descarga', battery.dischargeKW, 0.001, 100000);
  }
  return errors;
}
export function simulateSolar(input: SolarInput) {
  const errors = validateInput(input);
  if (errors.length) throw new Error(errors.join(' '));
  const { panel, inverter, battery } = input.equipment;
  const installedKWp = panel.count * panel.ratedWp / 1000;
  const thermalFactor = Math.max(0, 1 + panel.temperatureCoefficientPct / 100 * (input.cellTemperatureC - 25));
  const yieldFactor = thermalFactor * (1 - input.otherLossesPct / 100) * inverter.efficiencyPct / 100;
  const nominalBatteryKWh = battery.enabled ? battery.count * battery.nominalKWh : 0;
  const usableBatteryKWh = battery.enabled ? nominalBatteryKWh * battery.depthOfDischargePct / 100 : 0;
  const eta = battery.enabled ? Math.sqrt(battery.roundTripEfficiencyPct / 100) : 1;
  const weights = Array.from({ length: 12 }, (_, hour) => Math.sin(Math.PI * (hour + 0.5) / 12));
  const sumWeights = weights.reduce((sum, value) => sum + value, 0);
  let productionKWh = 0, directKWh = 0, chargedKWh = 0, dischargedKWh = 0, exportedKWh = 0, gridKWh = 0, batteryLossKWh = 0, endStoredKWh = 0, clippingKWh = 0;
  for (let day = 0; day < 30; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const daylight = hour >= 6 && hour < 18;
      const irradianceRatio = daylight ? weights[hour - 6] / sumWeights * input.peakSunHours : 0;
      const availableAC = installedKWp * irradianceRatio * yieldFactor;
      const solar = Math.min(availableAC, inverter.acKW);
      const load = input.monthlyLoadKWh / 30 / 12 * (daylight ? input.daytimeLoadPct / 100 : 1 - input.daytimeLoadPct / 100);
      const direct = Math.min(solar, load);
      const surplus = solar - direct;
      const deficit = load - direct;
      const charge = battery.enabled ? Math.min(surplus, battery.chargeKW * battery.count, Math.max(0, usableBatteryKWh - endStoredKWh) / eta) : 0;
      endStoredKWh += charge * eta;
      const discharge = battery.enabled ? Math.min(deficit, battery.dischargeKW * battery.count, endStoredKWh * eta) : 0;
      endStoredKWh = Math.max(0, endStoredKWh - discharge / eta);
      productionKWh += solar; directKWh += direct; chargedKWh += charge; dischargedKWh += discharge;
      exportedKWh += surplus - charge; gridKWh += deficit - discharge;
      batteryLossKWh += charge * (1 - eta) + discharge * (1 / eta - 1);
      clippingKWh += availableAC - solar;
    }
  }
  const selfConsumedKWh = directKWh + dischargedKWh;
  const annualSavingsCOP = selfConsumedKWh * 12 * input.tariffCOP;
  const annualNetSavingsCOP = annualSavingsCOP - input.annualMaintenanceCOP;
  const requiredKWp = yieldFactor > 0 ? input.monthlyLoadKWh / (30 * input.peakSunHours * yieldFactor) : null;
  return {
    installedKWp, areaM2: installedKWp / (panel.efficiencyPct / 100), thermalFactor,
    requiredKWp, suggestedPanels: requiredKWp === null ? null : Math.ceil(requiredKWp * 1000 / panel.ratedWp),
    nominalBatteryKWh, usableBatteryKWh, productionKWh, directKWh, chargedKWh, dischargedKWh,
    exportedKWh, gridKWh, batteryLossKWh, endStoredKWh, clippingKWh, selfConsumedKWh,
    annualSavingsCOP, annualNetSavingsCOP,
    paybackYears: annualNetSavingsCOP > 0 ? input.investmentCOP / annualNetSavingsCOP : null,
    netTenYearCOP: annualNetSavingsCOP * 10 - input.investmentCOP
  };
}
