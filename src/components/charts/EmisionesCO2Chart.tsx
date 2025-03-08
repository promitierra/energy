import React, { memo, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface EmisionesCO2ChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FF8042'];

const EmisionesCO2Chart = ({ data }: EmisionesCO2ChartProps) => {
  // Memoize the rendering function for each cell
  const renderLabel = useMemo(() => {
    return ({name, value}: {name: string, value: number}) => `${name}: ${value}t`;
  }, []);

  return (
    <>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={renderLabel}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => [`${value} toneladas CO₂`, '']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-200">
        <h4 className="font-medium mb-1 dark:text-white">Interpretación del gráfico:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Los paneles solares generan <span className="font-medium dark:text-white">8 veces menos emisiones</span> que la red eléctrica.</li>
          <li>El generador a gas tiene el mayor impacto ambiental, con <span className="font-medium dark:text-white">11.5 veces más emisiones</span> que los paneles solares.</li>
          <li>Las emisiones de los paneles solares se concentran principalmente en su fabricación.</li>
        </ul>
      </div>
    </>
  );
};

export default memo(EmisionesCO2Chart);