import React, { lazy, Suspense, memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import ChartErrorBoundary from './components/ui/ChartErrorBoundary';
import { useChartPreloader } from './hooks/useChartPreloader';

// Lazy load chart components
const CostosAcumuladosChart = lazy(() => import('./components/charts/CostosAcumuladosChart'));
const RetornoInversionChart = lazy(() => import('./components/charts/RetornoInversionChart'));
const EmisionesCO2Chart = lazy(() => import('./components/charts/EmisionesCO2Chart'));
const EstructuraCostosChart = lazy(() => import('./components/charts/EstructuraCostosChart'));
const AnalisisSensibilidadChart = lazy(() => import('./components/charts/AnalisisSensibilidadChart'));

// Loading component
const ChartLoader = memo(() => (
  <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando gráfico...</p>
    </div>
  </div>
));

// Data definitions
const chartData = {
  costosAcumulados: [
    { year: 'Año 1', redElectrica: 1976148, panelesSolares: 9750000, generadorGas: 5324400 },
    { year: 'Año 2', redElectrica: 4094395, panelesSolares: 10025000, generadorGas: 6173464 },
    { year: 'Año 3', redElectrica: 6333458, panelesSolares: 10300000, generadorGas: 7047872 },
    { year: 'Año 5', redElectrica: 11246354, panelesSolares: 10850000, generadorGas: 8872435 },
    { year: 'Año 7', redElectrica: 16805106, panelesSolares: 11400000, generadorGas: 10775981 },
    { year: 'Año 10', redElectrica: 26364968, panelesSolares: 14000000, generadorGas: 16744000 },
    { year: 'Año 15', redElectrica: 46575120, panelesSolares: 15750000, generadorGas: 25116000 },
    { year: 'Año 20', redElectrica: 71143254, panelesSolares: 19500000, generadorGas: 33988000 }
  ],
  retornoInversion: [
    { year: 1, netCashFlow: -9500000, cumulativeCashFlow: -9500000 },
    { year: 2, netCashFlow: 1976148, cumulativeCashFlow: -7523852 },
    { year: 3, netCashFlow: 1976148, cumulativeCashFlow: -5547704 },
    { year: 4, netCashFlow: 1976148, cumulativeCashFlow: -3571556 },
    { year: 5, netCashFlow: 1976148, cumulativeCashFlow: -1595408 },
    { year: 6, netCashFlow: 1976148, cumulativeCashFlow: 380740 },
    { year: 7, netCashFlow: 1976148, cumulativeCashFlow: 2356888 },
    { year: 8, netCashFlow: 1976148, cumulativeCashFlow: 4333036 },
    { year: 9, netCashFlow: 1976148, cumulativeCashFlow: 6309184 },
    { year: 10, netCashFlow: -523852, cumulativeCashFlow: 5785332 }
  ],
  emisionesCO2: [
    { name: 'Red eléctrica', value: 13.8 },
    { name: 'Paneles solares', value: 1.7 },
    { name: 'Generador gas', value: 19.6 }
  ],
  tiposCostos: [
    { name: 'Inversión inicial', redElectrica: 0, panelesSolares: 9500000, generadorGas: 4500000 },
    { name: 'Mantenimiento anual', redElectrica: 0, panelesSolares: 250000, generadorGas: 600000 },
    { name: 'Costo energético anual', redElectrica: 1976148, panelesSolares: 0, generadorGas: 224400 },
    { name: 'Reemplazo equipos', redElectrica: 0, panelesSolares: 2500000, generadorGas: 4500000 }
  ],
  sensibilidad: [
    { escenario: 'Base', panelesSolares: 5.7, generadorGas: 9.8 },
    { escenario: '+20% tarifa eléctrica', panelesSolares: 4.8, generadorGas: 8.2 },
    { escenario: '+20% precio gas', panelesSolares: 5.7, generadorGas: 11.7 },
    { escenario: '-20% costo paneles', panelesSolares: 4.6, generadorGas: 9.8 },
    { escenario: '+20% mantenimiento', panelesSolares: 6.0, generadorGas: 10.6 }
  ]
};

const GraficosComparativos = () => {
  // Iniciar la precarga de los gráficos
  useChartPreloader();

  // Memoize chart data
  const memoizedData = useMemo(() => ({
    costosAcumulados: chartData.costosAcumulados,
    retornoInversion: chartData.retornoInversion,
    emisionesCO2: chartData.emisionesCO2,
    tiposCostos: chartData.tiposCostos,
    sensibilidad: chartData.sensibilidad
  }), []);

  return (
    <div className="flex flex-col space-y-6">
      <Card className="w-full dark:bg-gray-800 shadow-lg">
        <CardHeader className="bg-blue-50 dark:bg-gray-700 rounded-t-lg">
          <CardTitle className="text-blue-800 dark:text-blue-200">
            Costos acumulados por alternativa energética
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-300">
            Comparación de costos totales acumulados a lo largo del tiempo para cada alternativa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartErrorBoundary chartName="Costos Acumulados">
            <Suspense fallback={<ChartLoader />}>
              <CostosAcumuladosChart data={memoizedData.costosAcumulados} />
            </Suspense>
          </ChartErrorBoundary>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 shadow-lg">
          <CardHeader className="bg-blue-50 dark:bg-gray-700 rounded-t-lg">
            <CardTitle className="text-blue-800 dark:text-blue-200">
              Retorno de inversión - Paneles solares
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-300">
              Flujo de caja acumulado de la inversión en sistema fotovoltaico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartErrorBoundary chartName="Retorno de Inversión">
              <Suspense fallback={<ChartLoader />}>
                <RetornoInversionChart 
                  data={memoizedData.retornoInversion}
                  initialInvestment={9500000}
                />
              </Suspense>
            </ChartErrorBoundary>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 shadow-lg">
          <CardHeader className="bg-blue-50 dark:bg-gray-700 rounded-t-lg">
            <CardTitle className="text-blue-800 dark:text-blue-200">
              Emisiones CO₂ (20 años) - Toneladas
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-300">
              Comparativa de impacto ambiental por alternativa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartErrorBoundary chartName="Emisiones CO₂">
              <Suspense fallback={<ChartLoader />}>
                <EmisionesCO2Chart data={memoizedData.emisionesCO2} />
              </Suspense>
            </ChartErrorBoundary>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-gray-800 shadow-lg">
        <CardHeader className="bg-blue-50 dark:bg-gray-700 rounded-t-lg">
          <CardTitle className="text-blue-800 dark:text-blue-200">
            Estructura de costos por alternativa
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-300">
            Desglose de los diferentes componentes de costos para cada opción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartErrorBoundary chartName="Estructura de Costos">
            <Suspense fallback={<ChartLoader />}>
              <EstructuraCostosChart data={memoizedData.tiposCostos} />
            </Suspense>
          </ChartErrorBoundary>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 shadow-lg">
        <CardHeader className="bg-blue-50 dark:bg-gray-700 rounded-t-lg">
          <CardTitle className="text-blue-800 dark:text-blue-200">
            Análisis de sensibilidad - Tiempo de retorno (años)
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-300">
            Impacto de diferentes escenarios en la viabilidad de las alternativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartErrorBoundary chartName="Análisis de Sensibilidad">
            <Suspense fallback={<ChartLoader />}>
              <AnalisisSensibilidadChart data={memoizedData.sensibilidad} />
            </Suspense>
          </ChartErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(GraficosComparativos);