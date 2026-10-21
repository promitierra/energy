import React, { useEffect, useRef, useState } from 'react';
import EquipmentEditor from './EquipmentEditor';
import { defaultEquipment, Equipment, simulateSolar, SolarInput, validateInput } from '../modules/solar/model';

type Fields = { consumoMensual: string; precioElectricidad: string; horasSol: string; inversionInicial: string; cellTemperatureC: string; otherLossesPct: string; daytimeLoadPct: string; annualMaintenanceCOP: string };
const initialFields = (): Fields => ({ consumoMensual: '', precioElectricidad: '', horasSol: '', inversionInicial: '', cellTemperatureC: '25', otherLossesPct: '14', daytimeLoadPct: '50', annualMaintenanceCOP: '0' });
const currency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const decimal = (value: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(value);
const inputClass = 'mt-1 block w-full rounded border border-gray-500 p-2 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';
export default function SimuladorPersonalizado() {
  const [fields, setFields] = useState(initialFields);
  const [equipment, setEquipment] = useState<Equipment>(defaultEquipment);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<{ input: SolarInput; result: ReturnType<typeof simulateSolar>; signature: string } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (submitted) resultsRef.current?.focus(); }, [submitted]);
  const signature = JSON.stringify({ fields, equipment });
  const fieldError = (key: keyof Fields, value: string) => {
    if (value.trim() === '') return 'El campo es requerido';
    const n = Number(value);
    if (!Number.isFinite(n)) return 'Ingrese un número finito';
    if (key === 'consumoMensual' && (n < 0 || n > 5000)) return 'El consumo debe estar entre 0 y 5000 kWh';
    if (key === 'horasSol' && (n < 0.01 || n > 12)) return 'Las horas de sol deben estar entre 0 y 12 (mínimo 0,01)';
    if (key === 'inversionInicial' && n < 0) return 'La inversión no puede ser negativa';
    if (key === 'precioElectricidad' && (n < 0 || n > 1000000)) return 'La tarifa debe estar entre 0 y 1000000 COP/kWh';
    return '';
  };
  const field = (key: keyof Fields, label: string, hint: string, min: number, max: number, testId?: string) => <label className="block" htmlFor={key}>
    <span className="font-semibold">{label} *</span>
    <input id={key} name={key} type="number" step="any" min={min} max={max} className={inputClass} value={fields[key]} required aria-required="true" aria-invalid={Boolean(errors[key])} aria-describedby={`${key}-hint${errors[key] ? ` ${key}-error` : ''}`} data-testid={testId} onChange={event => {
      setFields(previous => ({ ...previous, [key]: event.target.value }));
      setErrors(previous => ({ ...previous, [key]: fieldError(key, event.target.value) }));
    }} />
    <span id={`${key}-hint`} className="block text-sm text-gray-700 dark:text-gray-300">{hint}</span>
    {errors[key] && <span id={`${key}-error`} role="alert" className="block text-red-700 dark:text-red-300">{errors[key]}</span>}
  </label>;
  const calculate = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    (Object.keys(fields) as (keyof Fields)[]).forEach(key => { const error = fieldError(key, fields[key]); if (error) nextErrors[key] = error; });
    const input: SolarInput = { monthlyLoadKWh: Number(fields.consumoMensual), peakSunHours: Number(fields.horasSol), tariffCOP: Number(fields.precioElectricidad), investmentCOP: Number(fields.inversionInicial), cellTemperatureC: Number(fields.cellTemperatureC), otherLossesPct: Number(fields.otherLossesPct), daytimeLoadPct: Number(fields.daytimeLoadPct), annualMaintenanceCOP: Number(fields.annualMaintenanceCOP), equipment: JSON.parse(JSON.stringify(equipment)) };
    const validation = validateInput(input);
    if (validation.length) nextErrors.equipment = validation.join(' ');
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) setSubmitted({ input, result: simulateSolar(input), signature });
  };
  const result = submitted?.result;
  const rows = result ? [
    ['Potencia instalada (kWp)', result.installedKWp], ['Área de módulos aproximada (m²)', result.areaM2],
    ['Producción solar AC mensual (kWh)', result.productionKWh], ['Autoconsumo solar mensual (kWh)', result.selfConsumedKWh],
    ['Consumo directo solar (kWh)', result.directKWh], ['Compra de red mensual (kWh)', result.gridKWh],
    ['Excedentes sin remuneración (kWh)', result.exportedKWh], ['Recorte del inversor (kWh)', result.clippingKWh],
    ['Capacidad nominal de baterías (kWh)', result.nominalBatteryKWh], ['Capacidad utilizable de baterías (kWh)', result.usableBatteryKWh],
    ['Carga de batería desde AC (kWh)', result.chargedKWh], ['Descarga de batería hacia AC (kWh)', result.dischargedKWh],
    ['Pérdidas de batería (kWh)', result.batteryLossKWh], ['Energía almacenada al final (kWh)', result.endStoredKWh]
  ] as const : [];
  return <div className="space-y-6 text-gray-900 dark:text-gray-100">
    <section aria-label="Simulador de energía solar" className="rounded border border-gray-300 dark:border-gray-600 p-5 bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-semibold">Simulador Personalizado de Energía Solar</h2>
      <p className="my-3">Estimación con un perfil horario sintético de 30 días idénticos. No utiliza datos meteorológicos ni comprueba compatibilidad eléctrica de los equipos.</p>
      <form onSubmit={calculate} noValidate aria-label="Formulario de simulación" data-testid="simulador-form" className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {field('consumoMensual', 'Consumo mensual (kWh)', 'Consumo total de un mes de 30 días.', 0, 5000, 'input-consumo-mensual')}
          {field('precioElectricidad', 'Tarifa de energía (COP/kWh)', 'Tarifa evitada; los cargos fijos de la factura no se ahorran.', 0, 1000000, 'input-precio-electricidad')}
          {field('horasSol', 'Horas solares pico por día (HSP)', 'Irradiación sobre el plano del panel dividida por 1 kW/m²; no son horas de luz.', 0.01, 12, 'input-horas-sol')}
          {field('inversionInicial', 'Inversión inicial total (COP)', 'Incluya paneles, inversor, baterías, instalación y demás costos.', 0, 1e15, 'input-inversion-inicial')}
          {field('cellTemperatureC', 'Temperatura de célula (°C)', 'Temperatura efectiva del módulo durante generación, no temperatura ambiente.', -50, 100)}
          {field('otherLossesPct', 'Otras pérdidas del sistema (%)', 'Cableado, suciedad y otras pérdidas. Excluye inversor, temperatura y batería.', 0, 99)}
          {field('daytimeLoadPct', 'Consumo durante horas diurnas (%)', 'Se distribuye uniformemente entre 06:00 y 18:00; el resto durante la noche.', 0, 100)}
          {field('annualMaintenanceCOP', 'Mantenimiento anual (COP)', 'Se descuenta del ahorro anual para calcular recuperación simple.', 0, 1e15)}
        </div>
        <EquipmentEditor equipment={equipment} onChange={setEquipment} />
        {errors.equipment && <p role="alert" className="text-red-700 dark:text-red-300">{errors.equipment}</p>}
        <div className="flex gap-4"><button className="bg-blue-700 text-white px-5 py-3 rounded" type="submit" aria-label="Calcular simulación" data-testid="btn-calcular">Calcular</button>
          <button className="border border-gray-500 px-5 py-3 rounded" type="button" aria-label="Reiniciar formulario" data-testid="btn-reiniciar" onClick={() => { setFields(initialFields()); setEquipment(defaultEquipment()); setErrors({}); setSubmitted(null); }}>Reiniciar</button></div>
      </form>
    </section>
    {submitted && result && <div ref={resultsRef} tabIndex={-1} role="region" aria-label="Resultados de la simulación" data-testid="resultado-calculo" className="rounded border border-gray-400 p-5 space-y-5">
      <h2 className="text-xl font-semibold">Resultados de la simulación</h2>
      {signature !== submitted.signature && <p role="status" className="font-semibold">Datos modificados: vuelva a calcular. Estos resultados corresponden a la última simulación.</p>}
      <p>Consumo: {decimal(submitted.input.monthlyLoadKWh)} kWh/mes. Tarifa: {currency(submitted.input.tariffCOP)}/kWh. Equipos: {submitted.input.equipment.panel.model}, {submitted.input.equipment.inverter.model}{submitted.input.equipment.battery.enabled ? `, ${submitted.input.equipment.battery.model}` : ''}.</p>
      <table className="w-full text-left"><caption className="font-semibold text-left mb-2">Balance energético mensual y equipos</caption><tbody>{rows.map(([label, value]) => <tr key={label} className="border-b border-gray-300 dark:border-gray-600"><th scope="row" className="py-2 font-normal">{label}</th><td className="py-2">{decimal(value)}</td></tr>)}</tbody></table>
      <p>Dimensionamiento orientativo por energía: {result.requiredKWp === null ? 'No disponible con rendimiento térmico nulo.' : `${decimal(result.requiredKWp)} kWp; ${result.suggestedPanels} paneles de ${submitted.input.equipment.panel.ratedWp} Wp.`} Ignora horarios de consumo, almacenamiento y recorte del inversor; no garantiza cubrir la demanda.</p>
      <table className="w-full text-left"><caption className="font-semibold text-left mb-2">Análisis financiero simple</caption><tbody>
        <tr><th scope="row">Inversión inicial total</th><td>{currency(submitted.input.investmentCOP)}</td></tr>
        <tr><th scope="row">Ahorro mensual estimado</th><td>{currency(result.annualSavingsCOP / 12)}</td></tr>
        <tr><th scope="row">Ahorro anual estimado</th><td>{currency(result.annualSavingsCOP)}</td></tr>
        <tr><th scope="row">Mantenimiento anual</th><td>{currency(submitted.input.annualMaintenanceCOP)}</td></tr>
        <tr><th scope="row">Ahorro anual neto</th><td>{currency(result.annualNetSavingsCOP)}</td></tr>
        <tr><th scope="row">Tiempo de recuperación de inversión</th><td>{result.paybackYears === null ? 'Sin recuperación con ahorro neto no positivo' : `${decimal(result.paybackYears)} años`}</td></tr>
        <tr><th scope="row">Balance neto simple a 10 años</th><td>{currency(result.netTenYearCOP)}</td></tr>
      </tbody></table>
      <table className="w-full text-left"><caption className="font-semibold text-left mb-2">Sensibilidad: recuperación recalculada</caption><thead><tr><th scope="col">Escenario</th><th scope="col">Años</th></tr></thead><tbody>{[
        ['Base', {}], ['Tarifa +20% (máximo 1.000.000 COP/kWh)', { tariffCOP: Math.min(1000000, submitted.input.tariffCOP * 1.2) }], ['Tarifa −20%', { tariffCOP: submitted.input.tariffCOP * 0.8 }], ['Inversión −20%', { investmentCOP: submitted.input.investmentCOP * 0.8 }], ['HSP +20% (máximo 12)', { peakSunHours: Math.min(12, submitted.input.peakSunHours * 1.2) }], ['HSP −20% (mínimo 0,01)', { peakSunHours: Math.max(0.01, submitted.input.peakSunHours * 0.8) }]
      ].map(([name, patch]) => { const scenario = simulateSolar({ ...submitted.input, ...(patch as Partial<SolarInput>) }); return <tr key={name as string}><th scope="row" className="font-normal py-1">{name as string}</th><td>{scenario.paybackYears === null ? 'Sin recuperación' : decimal(scenario.paybackYears)}</td></tr>; })}</tbody></table>
      <p className="text-sm">Se anualiza el mes × 12 (360 días sintéticos). Batería inicialmente vacía, sin carga desde red ni ingresos por excedentes. Sin estacionalidad, degradación, financiación, impuestos ni reemplazos. El área corresponde a módulos, sin pasillos. La batería se modela con acoplamiento AC equivalente y pérdidas simétricas; no es un cálculo de autonomía o de seguridad eléctrica.</p>
    </div>}
  </div>;
}
