import React from 'react';
import { Equipment, Feature } from '../modules/solar/model';

const inputClass = 'mt-1 block w-full rounded border border-gray-500 p-2 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100';
type Group = 'panel' | 'inverter' | 'battery';
export default function EquipmentEditor({ equipment, onChange }: { equipment: Equipment; onChange: (value: Equipment) => void }) {
  const update = (group: Group, key: string, value: unknown) => onChange({ ...equipment, [group]: { ...equipment[group], [key]: value } });
  const number = (group: Group, key: string, label: string, min: number, max?: number, step = 'any') => {
    const id = `equipo-${group}-${key}`;
    return <label key={id} htmlFor={id} className="block text-sm">{label}<input id={id} type="number" className={inputClass} min={min} max={max} step={step} required value={Number.isFinite((equipment[group] as unknown as Record<string, number>)[key]) ? (equipment[group] as unknown as Record<string, number>)[key] : ''} onChange={event => update(group, key, event.target.value === '' ? NaN : Number(event.target.value))} /></label>;
  };
  const features = (group: Group, title: string) => <div className="space-y-2 col-span-full">
    <p className="text-sm">Características adicionales: informativas, no modifican el cálculo.</p>
    {equipment[group].features.map((feature: Feature, index) => <div key={index} className="flex flex-wrap gap-2">
      <label>Característica {index + 1} de {title}<input className={inputClass} value={feature.name} onChange={event => update(group, 'features', equipment[group].features.map((row, i) => i === index ? { ...row, name: event.target.value } : row))} /></label>
      <label>Valor {index + 1} de {title}<input className={inputClass} value={feature.value} onChange={event => update(group, 'features', equipment[group].features.map((row, i) => i === index ? { ...row, value: event.target.value } : row))} /></label>
      <button type="button" className="underline p-2" onClick={() => update(group, 'features', equipment[group].features.filter((_, i) => i !== index))}>Eliminar característica {index + 1} de {title}</button>
    </div>)}
    <button type="button" className="underline py-2" onClick={() => update(group, 'features', [...equipment[group].features, { name: '', value: '' }])}>Añadir característica de {title}</button>
  </div>;
  const model = (group: Group, title: string) => <label className="block text-sm">Modelo de {title}<input className={inputClass} value={equipment[group].model} onChange={event => update(group, 'model', event.target.value)} /></label>;
  return <section aria-label="Configuración de equipos" className="space-y-5 text-gray-900 dark:text-gray-100">
    <h3 className="text-xl font-semibold">Equipos y características</h3>
    <p>Valores de ejemplo editables; no representan recomendaciones de compra. Copie las especificaciones de sus fichas técnicas.</p>
    <fieldset className="border border-gray-400 rounded p-4 grid md:grid-cols-2 gap-4"><legend className="font-semibold px-2">Paneles solares</legend>
      {model('panel', 'panel')}{number('panel', 'count', 'Cantidad de paneles', 0, 100000, '1')}
      {number('panel', 'ratedWp', 'Potencia nominal por panel (Wp, STC)', 1, 10000)}
      {number('panel', 'efficiencyPct', 'Eficiencia del panel (%, solo área)', 0.01, 100)}
      {number('panel', 'temperatureCoefficientPct', 'Coeficiente térmico de potencia (%/°C)', -2, 0)}
      {features('panel', 'panel')}
    </fieldset>
    <fieldset className="border border-gray-400 rounded p-4 grid md:grid-cols-2 gap-4"><legend className="font-semibold px-2">Inversor</legend>
      {model('inverter', 'inversor')}{number('inverter', 'acKW', 'Potencia AC total del inversor (kW)', 0.001, 100000)}
      {number('inverter', 'efficiencyPct', 'Eficiencia del inversor (%)', 0.01, 100)}{features('inverter', 'inversor')}
    </fieldset>
    <fieldset className="border border-gray-400 rounded p-4 space-y-4"><legend className="font-semibold px-2">Baterías</legend>
      <label className="flex gap-2"><input type="checkbox" checked={equipment.battery.enabled} onChange={event => update('battery', 'enabled', event.target.checked)} /> Incluir almacenamiento</label>
      {equipment.battery.enabled && <div className="grid md:grid-cols-2 gap-4">
        {model('battery', 'batería')}{number('battery', 'count', 'Cantidad de baterías', 1, 100000, '1')}
        {number('battery', 'nominalKWh', 'Capacidad nominal por batería (kWh)', 0.001, 100000)}
        {number('battery', 'depthOfDischargePct', 'Profundidad de descarga utilizable (%)', 0.01, 100)}
        {number('battery', 'roundTripEfficiencyPct', 'Eficiencia de ciclo completo (%)', 0.01, 100)}
        {number('battery', 'chargeKW', 'Potencia máxima de carga por batería (kW)', 0.001, 100000)}
        {number('battery', 'dischargeKW', 'Potencia máxima de descarga por batería (kW)', 0.001, 100000)}
        {features('battery', 'batería')}
      </div>}
    </fieldset>
  </section>;
}
