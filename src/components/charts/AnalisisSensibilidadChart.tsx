import React, { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalisisSensibilidadChartProps {
  data: Array<{
    escenario: string;
    panelesSolares: number;
    generadorGas: number;
  }>;
}

const AnalisisSensibilidadChart = ({ data }: AnalisisSensibilidadChartProps) => {
  return (
    <>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="escenario" 
              stroke="#CBD5E0" 
              className="dark:text-gray-100" 
            />
            <YAxis 
              label={{ 
                value: 'Años', 
                angle: -90, 
                position: 'insideLeft' 
              }} 
              stroke="#CBD5E0" 
              className="dark:text-gray-100" 
            />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="panelesSolares" 
              name="Paneles solares" 
              fill="#00C49F" 
            />
            <Bar 
              dataKey="generadorGas" 
              name="Generador gas" 
              fill="#FF8042" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-200">
        <h4 className="font-medium mb-1 dark:text-white">Interpretación del gráfico:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>En todos los escenarios, los paneles solares muestran un tiempo de retorno significativamente menor que el generador a gas.</li>
          <li>El mejor escenario para paneles solares es la reducción del 20% en su costo (4.6 años).</li>
          <li>El aumento en precios del gas afecta negativamente al generador pero no impacta a los paneles solares.</li>
          <li>Los paneles solares muestran mayor resistencia a variaciones adversas y mejor respuesta a escenarios favorables.</li>
        </ul>
      </div>
    </>
  );
};

export default memo(AnalisisSensibilidadChart);