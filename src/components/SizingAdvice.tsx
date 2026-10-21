import React from 'react';
import { SolarInput } from '../modules/solar/model';
import { suggestSizing } from '../modules/solar/sizing';
const number = (v: number) => v.toLocaleString('es-CO', { maximumFractionDigits: 2 });
export default function SizingAdvice({ input }: { input: SolarInput }) {
  const sizing = suggestSizing(input);
  const offGrid = input.projectType === 'off-grid';
  const comparison = (current: number, minimum: number | null) => minimum === null ? 'No se encontró una solución dentro del rango del modelo.'
    : current + 1e-8 < minimum ? `Por debajo: faltan ${number(minimum - current)}.`
      : current > minimum + 1e-8 ? `Por encima del objetivo en ${number(current - minimum)}; puede aportar margen adicional.` : 'Cumple el mínimo del objetivo.';
  return <section aria-label="Sugerencias de dimensionamiento" className="rounded border border-blue-500 p-4 space-y-3">
    <h3 className="text-xl font-semibold">Cantidades mínimas sugeridas</h3>
    <p>{offGrid ? 'Objetivo: cubrir el día sintético recurrente y la autonomía solicitada sin red.' : 'Objetivo solar: producir el equivalente al consumo mensual; la red cubre los déficits horarios. No exige autoconsumo del 100%.'}</p>
    <ul className="list-disc pl-5 space-y-3">
      <li><strong>Paneles: {sizing.minimumPanels === null ? 'sin solución' : sizing.minimumPanels}</strong> de {input.equipment.panel.ratedWp} Wp. Configurados: {input.equipment.panel.count}. {comparison(input.equipment.panel.count, sizing.minimumPanels)}</li>
      <li><strong>Baterías: {sizing.minimumBatteries}</strong> de {number(sizing.batteryUnitKWh)} kWh. Configuradas: {input.equipment.battery.enabled ? input.equipment.battery.count : 0}. {comparison(input.equipment.battery.enabled ? input.equipment.battery.count : 0, sizing.minimumBatteries)}
        <p>{offGrid ? `Autonomía objetivo: ${input.autonomyDays ?? 1} días sin sol, con el banco inicialmente lleno; no se simula ese evento meteorológico.` : input.equipment.battery.enabled ? 'Objetivo opcional de almacenamiento: energía nocturna; depende de que haya excedentes para cargar.' : `En on-grid la batería no es obligatoria. Para trasladar la energía nocturna: aproximadamente ${sizing.nightShiftBatteries} unidades de esta ficha.`}</p>
        {sizing.batteryUsesExample && <p>Ficha de batería incompleta: sugerencia calculada con la batería de ejemplo.</p>}
      </li>
      <li><strong>Inversor: {sizing.minimumInverterKW === null ? 'sin solución' : `${number(sizing.minimumInverterKW)} kW AC como mínimo para este perfil`}</strong>. Configurado: {number(input.equipment.inverter.acKW)} kW. {comparison(input.equipment.inverter.acKW, sizing.minimumInverterKW)}
        <p>Usa el mayor campo solar entre el configurado y el sugerido para evitar recorte en el perfil sintético.{offGrid && ` Además, exige al menos ${number(sizing.loadPeakKW)} kW para la carga simultánea y operación formadora de red en modo aislado.`} Verifique tensión, rango MPPT, corriente máxima y potencia de arranque con las fichas de los equipos.</p>
      </li>
    </ul>
    {!sizing.feasible && <p role="status">No se puede cubrir este objetivo con la ficha propuesta dentro de los límites de búsqueda. Revise potencia de carga/descarga, capacidad, pérdidas y recurso solar.</p>}
    <p className="text-sm">Las cantidades se proponen como conjunto: cambiar solo paneles puede dejar insuficiente el inversor o la batería. Estar por encima no significa un error. No incluye margen por clima adverso ni garantiza suministro continuo. La simulación real comienza con batería vacía y puede mostrar déficit inicial.</p>
  </section>;
}
