import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function GraficosComparativos() {
  // Datos para gráfico de costos acumulados
  const costosAcumulados = [
    { year: 'Año 1', redElectrica: 1976148, panelesSolares: 9750000, generadorGas: 5324400 },
    { year: 'Año 2', redElectrica: 4094395, panelesSolares: 10025000, generadorGas: 6173464 },
    { year: 'Año 3', redElectrica: 6333458, panelesSolares: 10300000, generadorGas: 7047872 },
    { year: 'Año 5', redElectrica: 11246354, panelesSolares: 10850000, generadorGas: 8872435 },
    { year: 'Año 7', redElectrica: 16805106, panelesSolares: 11400000, generadorGas: 10775981 },
    { year: 'Año 10', redElectrica: 26364968, panelesSolares: 14000000, generadorGas: 16744000 },
    { year: 'Año 15', redElectrica: 46575120, panelesSolares: 15750000, generadorGas: 25116000 },
    { year: 'Año 20', redElectrica: 71143254, panelesSolares: 19500000, generadorGas: 33988000 }
  ];

  // Datos para gráfico de retorno de inversión
  const retornoInversion = [
    { year: 'Año 1', flujo: -9500000 },
    { year: 'Año 2', flujo: -7523852 },
    { year: 'Año 3', flujo: -5547704 },
    { year: 'Año 4', flujo: -3571556 },
    { year: 'Año 5', flujo: -1595408 },
    { year: 'Año 6', flujo: 380740 },
    { year: 'Año 7', flujo: 2356888 },
    { year: 'Año 8', flujo: 4333036 },
    { year: 'Año 9', flujo: 6309184 },
    { year: 'Año 10', flujo: 5785332 }
  ];

  // Datos para gráfico de emisiones de CO2
  const emisionesCO2 = [
    { name: 'Red eléctrica', value: 13.8 },
    { name: 'Paneles solares', value: 1.7 },
    { name: 'Generador gas', value: 19.6 }
  ];

  // Datos para gráfico de costos mensuales por tipo
  const tiposCostos = [
    { name: 'Inversión inicial', redElectrica: 0, panelesSolares: 9500000, generadorGas: 4500000 },
    { name: 'Mantenimiento anual', redElectrica: 0, panelesSolares: 250000, generadorGas: 600000 },
    { name: 'Costo energético anual', redElectrica: 1976148, panelesSolares: 0, generadorGas: 224400 },
    { name: 'Reemplazo equipos', redElectrica: 0, panelesSolares: 2500000, generadorGas: 4500000 }
  ];

  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FF8042'];

  return (
    <div className="flex flex-col space-y-6">
      <Card className="w-full dark:bg-gray-800 shadow-lg">
        <CardHeader className="bg-blue-50 dark:bg-gray-700 rounded-t-lg">
          <CardTitle className="text-blue-800 dark:text-blue-200">Costos acumulados por alternativa energética</CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-300">
            Comparación de costos totales acumulados a lo largo del tiempo para cada alternativa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costosAcumulados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" stroke="#CBD5E0" className="dark:text-gray-100" />
                <YAxis tickFormatter={(value: number) => `$${Math.round(value/1000000)}M`} stroke="#CBD5E0" className="dark:text-gray-100" />
                <Tooltip formatter={(value: any) => [`$${new Intl.NumberFormat().format(value)} COP`, '']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="redElectrica" 
                  name="Red eléctrica" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="panelesSolares" 
                  name="Paneles solares" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="generadorGas" 
                  name="Generador gas" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-200">
            <h4 className="font-medium mb-1 dark:text-white">Interpretación del gráfico:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="text-blue-500 font-medium">Red eléctrica:</span> Muestra el crecimiento más acelerado de costos, sin inversión inicial pero con fuerte impacto de la inflación anual.</li>
              <li><span className="text-green-500 font-medium">Paneles solares:</span> Alta inversión inicial pero crecimiento muy moderado. Se convierte en la opción más económica a partir del año 6.</li>
              <li><span className="text-orange-500 font-medium">Generador a gas:</span> Inversión inicial moderada pero nunca llega a ser la opción más económica. Muestra un escalón en el año 15 por reemplazo.</li>
              <li><span className="font-medium dark:text-white">Punto clave:</span> Los paneles solares generan un ahorro acumulado superior a $51 millones COP al cabo de 20 años comparado con la red eléctrica.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 shadow-lg">
          <CardHeader className="bg-blue-50 dark:bg-gray-700 rounded-t-lg">
            <CardTitle className="text-blue-800 dark:text-blue-200">Retorno de inversión - Paneles solares</CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-300">Flujo de caja acumulado de la inversión en sistema fotovoltaico</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={retornoInversion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" stroke="#CBD5E0" className="dark:text-gray-100" />
                  <YAxis tickFormatter={(value: number) => `$${Math.round(value/1000000)}M`} stroke="#CBD5E0" className="dark:text-gray-100" />
                  <Tooltip formatter={(value: any) => [`$${new Intl.NumberFormat().format(value)} COP`, 'Flujo acumulado']} />
                  <Bar 
                    dataKey="flujo" 
                    name="Flujo acumulado"
                  >
                    {retornoInversion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.flujo < 0 ? "#FF8042" : "#00C49F"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-200">
              <h4 className="font-medium mb-1 dark:text-white">Interpretación del gráfico:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Las barras <span className="text-orange-500 font-medium">naranjas</span> (negativas) representan el periodo de recuperación de la inversión.</li>
                <li>Las barras <span className="text-green-500 font-medium">verdes</span> (positivas) muestran los beneficios netos acumulados.</li>
                <li>El punto de equilibrio se alcanza aproximadamente a los 5.7 años.</li>
                <li>La caída en el año 10 representa el impacto del reemplazo del inversor.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 shadow-lg">
          <CardHeader className="bg-blue-50 dark:bg-gray-700 rounded-t-lg">
            <CardTitle className="text-blue-800 dark:text-blue-200">Emisiones CO₂ (20 años) - Toneladas</CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-300">Comparativa de impacto ambiental por alternativa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emisionesCO2}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({name, value}) => `${name}: ${value}t`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {emisionesCO2.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-gray-800 shadow-lg">
        <CardHeader className="bg-blue-50 dark:bg-gray-700 rounded-t-lg">
          <CardTitle className="text-blue-800 dark:text-blue-200">Estructura de costos por alternativa</CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-300">Desglose de los diferentes componentes de costos para cada opción</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tiposCostos}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value: number) => `$${Math.round(value/1000000)}M`} stroke="#CBD5E0" className="dark:text-gray-100" />
                <YAxis dataKey="name" type="category" width={150} stroke="#CBD5E0" className="dark:text-gray-100" />
                <Tooltip formatter={(value: any) => [`$${new Intl.NumberFormat().format(value)} COP`, '']} />
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
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 shadow-lg">
        <CardHeader className="bg-blue-50 dark:bg-gray-700 rounded-t-lg">
          <CardTitle className="text-blue-800 dark:text-blue-200">Análisis de sensibilidad - Tiempo de retorno (años)</CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-300">Impacto de diferentes escenarios en la viabilidad de las alternativas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { escenario: 'Base', panelesSolares: 5.7, generadorGas: 9.8 },
                  { escenario: '+20% tarifa eléctrica', panelesSolares: 4.8, generadorGas: 8.2 },
                  { escenario: '+20% precio gas', panelesSolares: 5.7, generadorGas: 11.7 },
                  { escenario: '-20% costo paneles', panelesSolares: 4.6, generadorGas: 9.8 },
                  { escenario: '+20% mantenimiento', panelesSolares: 6.0, generadorGas: 10.6 }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="escenario" stroke="#CBD5E0" className="dark:text-gray-100" />
                <YAxis label={{ value: 'Años', angle: -90, position: 'insideLeft' }} stroke="#CBD5E0" className="dark:text-gray-100" />
                <Tooltip />
                <Legend />
                <Bar dataKey="panelesSolares" name="Paneles solares" fill="#00C49F" />
                <Bar dataKey="generadorGas" name="Generador gas" fill="#FF8042" />
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
        </CardContent>
      </Card>
    </div>
  );
}

export default GraficosComparativos;