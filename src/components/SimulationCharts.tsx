import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SolarInput, simulateSolar } from '../modules/solar/model';
import { useTheme } from '../theme/ThemeProvider';

export type SensitivityRow = { name: string; result: ReturnType<typeof simulateSolar> };
export default function SimulationCharts({ input, result, scenarios }: { input: SolarInput; result: ReturnType<typeof simulateSolar>; scenarios: SensitivityRow[] }) {
  const { theme } = useTheme();
  const ink = theme === 'dark' ? '#e5e7eb' : '#374151';
  const blue = theme === 'dark' ? '#60a5fa' : '#1d4ed8';
  const green = theme === 'dark' ? '#34d399' : '#047857';
  const red = theme === 'dark' ? '#fca5a5' : '#b91c1c';
  const offGrid = input.projectType === 'off-grid';
  const energy = [{ name: 'Solar directo', kWh: result.directKWh }, { name: 'Batería', kWh: result.dischargedKWh },
    { name: offGrid ? 'Sin cubrir' : 'Red', kWh: offGrid ? result.unmetKWh : result.gridKWh },
    { name: offGrid ? 'No usado' : 'Excedente', kWh: offGrid ? result.curtailedKWh : result.exportedKWh }];
  const money = Array.from({ length: 11 }, (_, year) => ({ year, net: year * result.annualNetSavingsCOP - input.investmentCOP }));
  const sensitivity = scenarios.map(s => ({ name: s.name, value: offGrid ? s.result.unmetKWh : s.result.annualNetSavingsCOP }));
  const format = (v: number) => new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
  const figure = (title: string, description: string, children: React.ReactElement) => <figure className="min-w-0 rounded border border-gray-400 p-3" aria-label={title}>
    <figcaption className="font-semibold mb-2">{title}</figcaption><p className="text-sm mb-3">{description}</p>
    <div aria-hidden="true" className="h-64 w-full"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>
  </figure>;
  return <section aria-label="Gráficos de la simulación" className="space-y-4">
    <h3 className="text-xl font-semibold">Gráficos de la simulación</h3>
    <p className="text-sm">Los valores y escenarios se muestran también en las tablas de resultados.</p>
    <div className="grid xl:grid-cols-2 gap-4">
      {figure('Balance energético mensual', 'Energía entregada al hogar y excedentes, en kWh.', <BarChart data={energy} layout="vertical" margin={{ left: 0, right: 10 }}><CartesianGrid strokeDasharray="3 3"/><XAxis type="number" tick={{ fill: ink }} tickFormatter={format}/><YAxis type="category" dataKey="name" width={90} interval={0} tick={{ fill: ink, fontSize: 11 }}/><Tooltip/><Bar dataKey="kWh" fill={blue} isAnimationActive={false}/></BarChart>)}
      {figure('Perfil horario del día 30', 'Producción, demanda y descarga de batería en el último día sintético (kWh por intervalo de una hora).', <LineChart data={result.hourly} margin={{ right: 12 }}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="hour" tick={{ fill: ink }}/><YAxis tick={{ fill: ink }} tickFormatter={format}/><Tooltip/><Legend/><Line dataKey="solar" name="Solar" stroke={blue} dot={false} isAnimationActive={false}/><Line dataKey="load" name="Demanda" stroke={red} dot={false} isAnimationActive={false}/><Line dataKey="battery" name="Batería" stroke={green} dot={false} isAnimationActive={false}/></LineChart>)}
      {!offGrid && figure('Balance financiero acumulado', 'Ahorro neto acumulado menos inversión inicial, COP. Puede ser negativo.', <LineChart data={money} margin={{ right: 12 }}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year" tick={{ fill: ink }}/><YAxis tick={{ fill: ink }} tickFormatter={format}/><Tooltip formatter={(v: number) => `${Math.round(v).toLocaleString('es-CO')} COP`}/><Line dataKey="net" name="Balance neto" stroke={blue} dot={false} isAnimationActive={false}/></LineChart>)}
      {figure('Análisis de sensibilidad', offGrid ? 'Demanda mensual sin cubrir (kWh); menor es mejor.' : 'Ahorro anual neto (COP), recalculado para cada escenario.', <BarChart data={sensitivity} layout="vertical" margin={{ left: 0, right: 15 }}><CartesianGrid strokeDasharray="3 3"/><XAxis type="number" tick={{ fill: ink }} tickFormatter={format}/><YAxis type="category" dataKey="name" width={100} tick={{ fill: ink, fontSize: 11 }}/><Tooltip/><Bar dataKey="value" name={offGrid ? 'Sin cubrir (kWh)' : 'Ahorro neto (COP)'} fill={green} isAnimationActive={false}/></BarChart>)}
    </div>
    <details><summary className="cursor-pointer underline">Ver datos horarios y financieros de los gráficos</summary>
      <div className="overflow-x-auto"><table className="w-full text-left"><caption>Día 30: energía por hora (kWh)</caption><thead><tr><th>Hora</th><th>Solar</th><th>Demanda</th><th>Batería</th></tr></thead><tbody>{result.hourly.map(h => <tr key={h.hour}><th scope="row">{h.hour}:00</th><td>{h.solar.toFixed(3)}</td><td>{h.load.toFixed(3)}</td><td>{h.battery.toFixed(3)}</td></tr>)}</tbody></table></div>
      {!offGrid && <table className="w-full text-left"><caption>Balance financiero acumulado (COP)</caption><thead><tr><th>Año</th><th>Balance</th></tr></thead><tbody>{money.map(y => <tr key={y.year}><th scope="row">{y.year}</th><td>{Math.round(y.net).toLocaleString('es-CO')}</td></tr>)}</tbody></table>}
    </details>
  </section>;
}
