import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import ChartErrorBoundary from '../ui/ChartErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useChartPreloader } from '../../hooks/useChartPreloader';

interface DataPoint {
  year: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

interface RetornoInversionChartProps {
  data: DataPoint[];
  initialInvestment: number;
  title?: string;
  description?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const calculateROI = (data: DataPoint[], initialInvestment: number): number => {
  if (!data || data.length === 0) return 0;
  
  // Encontrar el año en que el flujo acumulado supera la inversión inicial (punto de equilibrio)
  const breakEvenPoint = data.findIndex(point => point.cumulativeCashFlow >= initialInvestment);
  
  if (breakEvenPoint === -1) return data.length; // No se alcanza el punto de equilibrio en el período analizado
  
  // Calcular interpolación para obtener el año exacto (con decimales)
  if (breakEvenPoint === 0) return 0; // Caso especial: rentable desde el inicio
  
  const prevYear = data[breakEvenPoint - 1];
  const breakEvenYear = data[breakEvenPoint];
  
  const remainingToBreakEven = initialInvestment - prevYear.cumulativeCashFlow;
  const cashFlowInBreakEvenYear = breakEvenYear.cumulativeCashFlow - prevYear.cumulativeCashFlow;
  
  const fraction = remainingToBreakEven / cashFlowInBreakEvenYear;
  
  return prevYear.year + fraction;
};

const RetornoInversionChart: React.FC<RetornoInversionChartProps> = ({ 
  data, 
  initialInvestment, 
  title = "Retorno de Inversión", 
  description = "Análisis del flujo de caja acumulado y tiempo de recuperación de la inversión"
}) => {
  const [showTable, setShowTable] = useState(false);
  const roi = useMemo(() => calculateROI(data, initialInvestment), [data, initialInvestment]);
  // Registrar que este componente ha sido precargado
  useChartPreloader();
  
  const chartDescription = useMemo(() => {
    const years = Math.floor(roi);
    const months = Math.round((roi - years) * 12);
    
    let roiText = "";
    if (years > 0 && months > 0) {
      roiText = `${years} año${years !== 1 ? 's' : ''} y ${months} mes${months !== 1 ? 'es' : ''}`;
    } else if (years > 0) {
      roiText = `${years} año${years !== 1 ? 's' : ''}`;
    } else if (months > 0) {
      roiText = `${months} mes${months !== 1 ? 'es' : ''}`;
    } else {
      roiText = "menos de un mes";
    }
    
    return `El análisis muestra que la inversión inicial de ${formatCurrency(initialInvestment)} se recuperará en ${roiText}. ${
      roi > data.length ? "El retorno de inversión excede el período analizado." : ""
    }`;
  }, [roi, initialInvestment, data.length]);
  
  const toggleTableView = () => setShowTable(!showTable);
  
  return (
    <ChartErrorBoundary chartName="Retorno de Inversión">
      <Card className="w-full bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                {description}
              </CardDescription>
            </div>
            <button 
              onClick={toggleTableView} 
              className="text-sm px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300"
              aria-label={showTable ? "Mostrar gráfico" : "Mostrar tabla de datos"}
            >
              {showTable ? "Ver Gráfico" : "Ver Tabla"}
            </button>
          </div>
          
          <div 
            className="mt-2 p-3 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded-md"
            aria-live="polite"
          >
            {chartDescription}
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {!showTable ? (
            <div className="h-80 w-full" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    label={{ value: 'Año', position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis
                    tickFormatter={value => formatCurrency(value)}
                    label={{ 
                      value: 'Flujo de Caja (CLP)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelFormatter={(label) => `Año ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cumulativeCashFlow"
                    name="Flujo Acumulado"
                    stroke="#0088FE"
                    strokeWidth={2}
                    dot={true}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="netCashFlow"
                    name="Flujo Anual"
                    stroke="#00C49F"
                    strokeWidth={2}
                    dot={true}
                  />
                  <ReferenceLine
                    y={initialInvestment}
                    stroke="red"
                    strokeDasharray="3 3"
                    label={{
                      value: `Inversión Inicial: ${formatCurrency(initialInvestment)}`,
                      fill: 'red',
                      position: 'top',
                    }}
                  />
                  {/* Línea vertical para el punto de recuperación */}
                  {roi <= data.length && roi > 0 && (
                    <ReferenceLine
                      x={Math.ceil(roi)}
                      stroke="orange"
                      strokeDasharray="5 5"
                      label={{
                        value: 'Punto de recuperación',
                        position: 'top',
                        fill: 'orange',
                      }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div 
              className="overflow-auto max-h-80" 
              role="region" 
              aria-label="Tabla de datos de retorno de inversión"
              tabIndex={0}
            >
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <caption className="sr-only">Datos de retorno de inversión por año</caption>
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Año
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Flujo Anual
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Flujo Acumulado
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Balance con Inversión
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {data.map((item, index) => {
                    const balanceWithInvestment = item.cumulativeCashFlow - initialInvestment;
                    const isProfitable = balanceWithInvestment >= 0;
                    const isBreakEvenYear = isProfitable && index > 0 && data[index - 1].cumulativeCashFlow - initialInvestment < 0;
                    
                    return (
                      <tr 
                        key={item.year} 
                        className={isBreakEvenYear ? 'bg-green-50 dark:bg-green-900/20' : ''}
                      >
                        <td className="px-4 py-2">
                          {item.year}
                          {isBreakEvenYear && (
                            <span 
                              className="ml-1 text-green-600 dark:text-green-400 text-xs"
                              aria-label="Año de recuperación de la inversión"
                            >
                              (Recuperación)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">{formatCurrency(item.netCashFlow)}</td>
                        <td className="px-4 py-2">{formatCurrency(item.cumulativeCashFlow)}</td>
                        <td className={`px-4 py-2 ${isProfitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(balanceWithInvestment)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Descripción textual para lectores de pantalla siempre disponible */}
          <div className="sr-only">
            <h3>Resumen del análisis de retorno de inversión</h3>
            <p>{chartDescription}</p>
            <ul>
              {data.map(item => (
                <li key={item.year}>
                  Año {item.year}: Flujo anual {formatCurrency(item.netCashFlow)}, 
                  Flujo acumulado {formatCurrency(item.cumulativeCashFlow)}, 
                  Balance con inversión {formatCurrency(item.cumulativeCashFlow - initialInvestment)}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </ChartErrorBoundary>
  );
};

export default RetornoInversionChart;