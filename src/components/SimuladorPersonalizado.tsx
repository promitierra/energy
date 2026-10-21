import React, { useEffect, useRef, useState } from 'react';
import EquipmentEditor from './EquipmentEditor';
import SimulationCharts, { SensitivityRow } from './SimulationCharts';
import SizingAdvice from './SizingAdvice';
import { defaultEquipment, Equipment, simulateSolar, SolarInput, ProjectType, validateInput } from '../modules/solar/model';

type Fields = { autonomyDays: string; peakLoadKW: string; consumoMensual: string; precioElectricidad: string; horasSol: string; inversionInicial: string; cellTemperatureC: string; otherLossesPct: string; daytimeLoadPct: string; annualMaintenanceCOP: string };
const initialFields = (): Fields => ({ autonomyDays: '1', peakLoadKW: '3', consumoMensual: '', precioElectricidad: '', horasSol: '', inversionInicial: '', cellTemperatureC: '25', otherLossesPct: '14', daytimeLoadPct: '50', annualMaintenanceCOP: '0' });
const currency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const decimal = (value: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(value);
const inputClass = 'mt-1 block w-full rounded border border-gray-500 p-2 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';
export default function SimuladorPersonalizado() {
  const [projectType, setProjectType] = useState<ProjectType>('on-grid');
  const [fields, setFields] = useState(initialFields);
  const [equipment, setEquipment] = useState<Equipment>(defaultEquipment);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<{ input: SolarInput; result: ReturnType<typeof simulateSolar>; signature: string } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (submitted) resultsRef.current?.focus(); }, [submitted]);
  const signature = JSON.stringify({ fields, equipment, projectType });
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
    (Object.keys(fields) as (keyof Fields)[]).forEach(key => { if ((projectType === 'off-grid' && key === 'precioElectricidad') || (projectType === 'on-grid' && (key === 'autonomyDays' || key === 'peakLoadKW'))) return; const error = fieldError(key, fields[key]); if (error) nextErrors[key] = error; });
    const input: SolarInput = { projectType, autonomyDays: projectType === 'off-grid' ? Number(fields.autonomyDays) : 1, peakLoadKW: projectType === 'off-grid' ? Number(fields.peakLoadKW) : 0, monthlyLoadKWh: Number(fields.consumoMensual), peakSunHours: Number(fields.horasSol), tariffCOP: projectType === 'on-grid' ? Number(fields.precioElectricidad) : 0, investmentCOP: Number(fields.inversionInicial), cellTemperatureC: Number(fields.cellTemperatureC), otherLossesPct: Number(fields.otherLossesPct), daytimeLoadPct: Number(fields.daytimeLoadPct), annualMaintenanceCOP: Number(fields.annualMaintenanceCOP), equipment: JSON.parse(JSON.stringify(equipment)) };
    const validation = validateInput(input);
    if (validation.length) nextErrors.equipment = validation.join(' ');
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) setSubmitted({ input, result: simulateSolar(input), signature });
  };
  const result = submitted?.result;
  const offGrid = submitted?.input.projectType === 'off-grid';
  const scenarios: SensitivityRow[] = submitted ? [
    ['Base', {}],
    ...(offGrid ? [] : [['Tarifa +20%', { tariffCOP: Math.min(1000000, submitted.input.tariffCOP * 1.2) }], ['Tarifa −20%', { tariffCOP: submitted.input.tariffCOP * 0.8 }], ['Inversión −20%', { investmentCOP: submitted.input.investmentCOP * 0.8 }]]),
    ['HSP +20%', { peakSunHours: Math.min(12, submitted.input.peakSunHours * 1.2) }],
    ['HSP −20%', { peakSunHours: Math.max(0.01, submitted.input.peakSunHours * 0.8) }]
  ].map(([name, patch]) => ({ name: name as string, result: simulateSolar({ ...submitted.input, ...(patch as Partial<SolarInput>) }) })) : [];
  const rows = result ? [
    ['Potencia instalada (kWp)', result.installedKWp], ['Área de módulos aproximada (m²)', result.areaM2],
    ['Producción solar AC mensual (kWh)', result.productionKWh], ['Autoconsumo solar mensual (kWh)', result.selfConsumedKWh],
    ['Consumo directo solar (kWh)', result.directKWh], ['Compra de red mensual (kWh)', result.gridKWh],
    ['Demanda sin cubrir (kWh)', result.unmetKWh], ['Excedente no aprovechado (kWh)', result.curtailedKWh],
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
        <label className="block font-semibold" htmlFor="project-type">Tipo de proyecto
          <select id="project-type" className={inputClass} value={projectType} onChange={event => { setProjectType(event.target.value as ProjectType); setErrors({}); }}>
            <option value="on-grid">On-grid — conectado a la red</option><option value="off-grid">Off-grid — aislado de la red</option>
          </select>
        </label>
        <p>{projectType === 'on-grid' ? 'La red cubre faltantes. Las baterías son opcionales y no se remunera la exportación.' : 'Sin suministro ni exportación a la red. Los faltantes se reportan como demanda sin cubrir, no como compras de energía.'}</p>
        <div className="grid md:grid-cols-2 gap-4">
          {projectType === 'off-grid' && <>
            {field('autonomyDays', 'Autonomía objetivo sin sol (días)', 'Para sugerir baterías: banco lleno al iniciar el evento. Use 1 a 7 días.', 1, 7)}
            {field('peakLoadKW', 'Carga simultánea máxima (kW)', 'Ejemplo: 3 kW. Reemplace por la suma de cargas simultáneas; los arranques se verifican aparte.', 0, 100000)}
          </>}
          {field('consumoMensual', 'Consumo mensual (kWh)', 'Consumo total de un mes de 30 días.', 0, 5000, 'input-consumo-mensual')}
          {projectType === 'on-grid' && field('precioElectricidad', 'Tarifa de energía (COP/kWh)', 'Tarifa evitada; los cargos fijos de la factura no se ahorran.', 0, 1000000, 'input-precio-electricidad')}
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
          <button className="border border-gray-500 px-5 py-3 rounded" type="button" aria-label="Reiniciar formulario" data-testid="btn-reiniciar" onClick={() => { setProjectType('on-grid'); setFields(initialFields()); setEquipment(defaultEquipment()); setErrors({}); setSubmitted(null); }}>Reiniciar</button></div>
      </form>
    </section>
    {submitted && result && <div ref={resultsRef} tabIndex={-1} role="region" aria-label="Resultados de la simulación" data-testid="resultado-calculo" className="rounded border border-gray-400 p-5 space-y-5">
      <h2 className="text-xl font-semibold">Resultados de la simulación</h2>
      {signature !== submitted.signature && <p role="status" className="font-semibold">Datos modificados: vuelva a calcular. Estos resultados corresponden a la última simulación.</p>}
      <p>Consumo: {decimal(submitted.input.monthlyLoadKWh)} kWh/mes. Proyecto: {offGrid ? 'Off-grid' : 'On-grid'}. {!offGrid && <>Tarifa: {currency(submitted.input.tariffCOP)}/kWh.</>} Equipos: {submitted.input.equipment.panel.model}, {submitted.input.equipment.inverter.model}{submitted.input.equipment.battery.enabled ? `, ${submitted.input.equipment.battery.model}` : ''}.</p>
      <SizingAdvice input={submitted.input} />
      <SimulationCharts input={submitted.input} result={result} scenarios={scenarios} />
      <table className="w-full text-left"><caption className="font-semibold text-left mb-2">Balance energético mensual y equipos</caption><tbody>{rows.map(([label, value]) => <tr key={label} className="border-b border-gray-300 dark:border-gray-600"><th scope="row" className="py-2 font-normal">{label}</th><td className="py-2">{decimal(value)}</td></tr>)}</tbody></table>
      {!offGrid ? <table className="w-full text-left"><caption className="font-semibold text-left mb-2">Análisis financiero simple</caption><tbody>
        <tr><th scope="row">Inversión inicial total</th><td>{currency(submitted.input.investmentCOP)}</td></tr>
        <tr><th scope="row">Ahorro mensual estimado</th><td>{currency(result.annualSavingsCOP / 12)}</td></tr>
        <tr><th scope="row">Ahorro anual estimado</th><td>{currency(result.annualSavingsCOP)}</td></tr>
        <tr><th scope="row">Mantenimiento anual</th><td>{currency(submitted.input.annualMaintenanceCOP)}</td></tr>
        <tr><th scope="row">Ahorro anual neto</th><td>{currency(result.annualNetSavingsCOP)}</td></tr>
        <tr><th scope="row">Tiempo de recuperación de inversión</th><td>{result.paybackYears === null ? 'Sin recuperación con ahorro neto no positivo' : `${decimal(result.paybackYears)} años`}</td></tr>
        <tr><th scope="row">Balance neto simple a 10 años</th><td>{currency(result.netTenYearCOP)}</td></tr>
      </tbody></table>
      : <p>Proyecto aislado: no se calculan ahorros de factura ni recuperación de inversión. Inversión: {currency(submitted.input.investmentCOP)}; mantenimiento anual: {currency(submitted.input.annualMaintenanceCOP)}. Para comparar costos se necesita una alternativa de suministro.</p>}
      <table className="w-full text-left"><caption className="font-semibold text-left mb-2">Sensibilidad recalculada</caption><thead><tr><th scope="col">Escenario</th><th scope="col">{offGrid ? 'Demanda sin cubrir (kWh/mes)' : 'Ahorro anual neto (COP)'}</th>{!offGrid && <th scope="col">Recuperación (años)</th>}</tr></thead><tbody>{scenarios.map(scenario => <tr key={scenario.name}><th scope="row" className="font-normal py-1">{scenario.name}</th><td>{offGrid ? decimal(scenario.result.unmetKWh) : currency(scenario.result.annualNetSavingsCOP)}</td>{!offGrid && <td>{scenario.result.paybackYears === null ? 'Sin recuperación' : decimal(scenario.result.paybackYears)}</td>}</tr>)}</tbody></table>
      <p className="text-sm">Sensibilidad limitada a HSP de 0,01 a 12 y tarifa máxima de 1.000.000 COP/kWh.</p>
      <p className="text-sm">Se anualiza el mes × 12 (360 días sintéticos). Batería inicialmente vacía, sin carga desde red ni ingresos por excedentes. Sin estacionalidad, degradación, financiación, impuestos ni reemplazos. El área corresponde a módulos, sin pasillos. La batería usa pérdidas simétricas. En off-grid, el inversor limita conjuntamente la energía solar y de batería entregada a la carga. El pico de carga se usa para dimensionar; no reemplaza el perfil horario sintético ni verifica corrientes de arranque.</p>
    </div>}
  </div>;
}
