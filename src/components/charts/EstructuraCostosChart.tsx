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

interface EstructuraCostosChartProps {
  data: Array<{
    name: string;
    redElectrica: number;
    panelesSolares: number;
    generadorGas: number;
  }>;
}

const EstructuraCostosChart = ({ data }: EstructuraCostosChartProps) => {
  return (
    <>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              tickFormatter={(value: number) => `$${Math.round(value/1000000)}M`} 
              stroke="#CBD5E0" 
              className="dark:text-gray-100" 
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={150} 
              stroke="#CBD5E0" 
              className="dark:text-gray-100" 
            />
            <Tooltip 
              formatter={(value: any) => [`${new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value)}`, '']} 
            />
            <Legend />
            <Bar dataKey="redElectrica" name="Red eléctrica" fill="#0088FE" />
            <Bar dataKey="panelesSolares" name="Paneles solares" fill="#00C49F" />
            <Bar dataKey="generadorGas" name="Generador gas" fill="#FF8042" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-200">
        <h4 className="font-medium mb-1 dark:text-white">Interpretación del gráfico:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="text-blue-500 font-medium">Red eléctrica:</span> Costos concentrados exclusivamente en el gasto energético anual, sin inversión ni mantenimiento.</li>
          <li><span className="text-green-500 font-medium">Paneles solares:</span> Mayores costos iniciales pero sin gastos energéticos anuales. Requiere reemplazo de inversor a los 10 años.</li>
          <li><span className="text-orange-500 font-medium">Generador a gas:</span> Combina todos los tipos de costos sin destacar en ninguno positivamente: inversión moderada, alto mantenimiento, costos energéticos continuos.</li>
        </ul>
      </div>
    </>
  );
};

export default memo(EstructuraCostosChart);