import React, { memo, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { simplifyDataPoints } from '../../utils/dataCompression';

interface CostosAcumuladosChartProps {
  data: Array<{
    year: string;
    redElectrica: number;
    panelesSolares: number;
    generadorGas: number;
  }>;
}

const CostosAcumuladosChart = ({ data }: CostosAcumuladosChartProps) => {
  // Estado para el índice de datos enfocado para navegación por teclado
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Optimizar dataset si es necesario
  const optimizedData = useMemo(() => {
    // Simplificar los datos si hay más de 15 puntos
    // para mejorar el rendimiento en dispositivos móviles
    return simplifyDataPoints(data, 15);
  }, [data]);

  // Crear una tabla de datos accesible para lectores de pantalla
  const accessibleTable = useMemo(() => {
    return (
      <div className="sr-only">
        <h2>Costos Acumulados por Año y Sistema Energético</h2>
        <p>Esta tabla muestra los costos acumulados en pesos para diferentes sistemas energéticos a lo largo del tiempo.</p>
        <table>
          <caption>Costos Acumulados Anuales por Sistema Energético</caption>
          <thead>
            <tr>
              <th scope="col">Año</th>
              <th scope="col">Red Eléctrica (COP)</th>
              <th scope="col">Paneles Solares (COP)</th>
              <th scope="col">Generador de Gas (COP)</th>
            </tr>
          </thead>
          <tbody>
            {optimizedData.map((item, index) => (
              <tr key={index}>
                <th scope="row">{item.year}</th>
                <td>{item.redElectrica.toLocaleString()}</td>
                <td>{item.panelesSolares.toLocaleString()}</td>
                <td>{item.generadorGas.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [optimizedData]);

  // Gestión de navegación por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev === null ? 0 : Math.min(prev + 1, optimizedData.length - 1)
        );
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev === null ? 0 : Math.max(prev - 1, 0)
        );
        break;
      default:
        break;
    }
  };

  // Formateo personalizado para tooltips
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-CO')} COP`;
  };

  // Descripción de tendencias para lectores de pantalla
  const getTrendDescription = () => {
    if (data.length < 2) return 'No hay suficientes datos para analizar tendencias.';
    
    const firstYear = data[0];
    const lastYear = data[data.length - 1];
    
    return `
      Tendencia general: En el periodo analizado de ${firstYear.year} a ${lastYear.year}:
      - Red Eléctrica: ${lastYear.redElectrica > firstYear.redElectrica ? 'Incremento' : 'Reducción'} de costos.
      - Paneles Solares: ${lastYear.panelesSolares > firstYear.panelesSolares ? 'Incremento' : 'Reducción'} de costos.
      - Generador de Gas: ${lastYear.generadorGas > firstYear.generadorGas ? 'Incremento' : 'Reducción'} de costos.
    `;
  };

  return (
    <div 
      role="region" 
      aria-label="Gráfico de costos acumulados por sistema energético"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="focus:outline-2 focus:outline-blue-500 rounded-md"
    >
      {accessibleTable}
      
      <div aria-hidden="true" className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={optimizedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              label={{ 
                value: 'Año', 
                position: 'insideBottomRight', 
                offset: -10 
              }}
            />
            <YAxis 
              label={{ 
                value: 'Costos Acumulados (COP)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={formatCurrency} 
              labelFormatter={(label) => `Año: ${label}`}
              wrapperStyle={{ outline: 'none' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ paddingTop: '10px' }}
            />
            <Line 
              name="Red Eléctrica" 
              type="monotone" 
              dataKey="redElectrica" 
              stroke="#FF5252" 
              activeDot={{ 
                r: focusedIndex !== null ? 8 : 5,
                stroke: '#FF5252',
                strokeWidth: 2,
                fill: '#FFFFFF'
              }} 
              dot={{ stroke: '#FF5252', strokeWidth: 2, r: 4, fill: '#FFFFFF' }}
            />
            <Line 
              name="Paneles Solares" 
              type="monotone" 
              dataKey="panelesSolares" 
              stroke="#4CAF50" 
              activeDot={{ 
                r: focusedIndex !== null ? 8 : 5,
                stroke: '#4CAF50',
                strokeWidth: 2,
                fill: '#FFFFFF'
              }} 
              dot={{ stroke: '#4CAF50', strokeWidth: 2, r: 4, fill: '#FFFFFF' }}
            />
            <Line 
              name="Generador de Gas" 
              type="monotone" 
              dataKey="generadorGas" 
              stroke="#2196F3" 
              activeDot={{ 
                r: focusedIndex !== null ? 8 : 5,
                stroke: '#2196F3',
                strokeWidth: 2,
                fill: '#FFFFFF'
              }} 
              dot={{ stroke: '#2196F3', strokeWidth: 2, r: 4, fill: '#FFFFFF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="sr-only" aria-live="polite">
        {focusedIndex !== null && optimizedData[focusedIndex] && (
          <div>
            <p>Año: {optimizedData[focusedIndex].year}</p>
            <p>Red Eléctrica: {formatCurrency(optimizedData[focusedIndex].redElectrica)}</p>
            <p>Paneles Solares: {formatCurrency(optimizedData[focusedIndex].panelesSolares)}</p>
            <p>Generador de Gas: {formatCurrency(optimizedData[focusedIndex].generadorGas)}</p>
          </div>
        )}
      </div>

      <div className="sr-only">{getTrendDescription()}</div>
    </div>
  );
};

export default memo(CostosAcumuladosChart);