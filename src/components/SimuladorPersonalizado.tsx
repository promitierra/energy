import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import Tooltip from './ui/tooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export interface FormValues {
  consumoMensual: string;
  horasSol: string;
  inversionInicial: string;
  precioElectricidad: string;
  eficienciaPaneles: string;
  vidaUtil: string;
}

interface FormErrors {
  consumoMensual?: string;
  horasSol?: string;
  inversionInicial?: string;
  precioElectricidad?: string;
  eficienciaPaneles?: string;
  vidaUtil?: string;
}

interface ResultadosSimulacion {
  potenciaRequerida: number;
  numeroPaneles: number;
  ahorroAnual: number;
  retornoInversion: number;
  comparativaFinanciera: { name: string; value: number }[];
}

const COLORES = ['#0088FE', '#00C49F', '#FF8042', '#8884d8'];

const SimuladorPersonalizado: React.FC = () => {
  const [values, setValues] = useState<FormValues>({
    consumoMensual: '',
    horasSol: '',
    inversionInicial: '',
    precioElectricidad: '',
    eficienciaPaneles: '20',
    vidaUtil: '25'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [resultados, setResultados] = useState<ResultadosSimulacion | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const resultadosRef = useRef<HTMLDivElement>(null);

  // Efecto para manejar el foco después de calcular
  useEffect(() => {
    if (resultados && resultadosRef.current) {
      resultadosRef.current.focus();
    }
  }, [resultados]);

  const validarCampo = (name: string, value: string): string | undefined => {
    if (!value) return 'El campo es requerido';

    const numValue = parseFloat(value);

    switch (name) {
      case 'consumoMensual':
        if (numValue < 0 || numValue > 5000) return 'El consumo debe estar entre 0 y 5000 kWh';
        break;
      case 'horasSol':
        if (numValue <= 0 || numValue > 12) return 'Las horas de sol deben estar entre 0 y 12';
        break;
      case 'inversionInicial':
        if (numValue < 0) return 'La inversión no puede ser negativa';
        break;
      case 'precioElectricidad':
        if (numValue < 300 || numValue > 1000) return 'La tarifa debe estar entre 300 y 1000 COP/kWh';
        break;
    }

    return undefined;
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    const error = validarCampo(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const calcular = useCallback(() => {
    // Validar todos los campos
    const newErrors: FormErrors = {};
    let hasErrors = false;

    Object.entries(values).forEach(([key, value]) => {
      if (key === 'eficienciaPaneles' || key === 'vidaUtil') return; // Opcionales
      
      const error = validarCampo(key, value);
      if (error) {
        hasErrors = true;
        newErrors[key as keyof FormErrors] = error;
      }
    });

    setErrors(newErrors);

    if (hasErrors) return;

    // Realizar cálculos
    const consumo = parseFloat(values.consumoMensual);
    const horasSol = parseFloat(values.horasSol);
    const tarifa = parseFloat(values.precioElectricidad);
    const inversion = parseFloat(values.inversionInicial);
    const eficiencia = parseFloat(values.eficienciaPaneles) / 100;
    const vidaUtil = parseInt(values.vidaUtil);

    // Calcular potencia requerida: consumo mensual * 1000 / (30 días * horas de sol * eficiencia)
    const potenciaRequerida = (consumo * 1000) / (30 * horasSol * eficiencia);
    
    // Paneles requeridos (asumiendo paneles estándar de 400W)
    const numeroPaneles = Math.ceil(potenciaRequerida / 400);
    
    // Ahorro mensual: consumo * tarifa
    const ahorroMensual = consumo * tarifa;
    const ahorroAnual = ahorroMensual * 12;
    
    // Retorno de inversión en años: inversión / ahorro anual
    const retornoInversion = inversion / ahorroAnual;

    // Comparativa financiera para gráfico
    const comparativaFinanciera = [
      { name: 'Inversión', value: inversion },
      { name: 'Ahorro a 10 años', value: ahorroAnual * 10 },
      { name: 'Ganancia neta', value: ahorroAnual * 10 - inversion },
      { name: 'Beneficio total', value: ahorroAnual * vidaUtil - inversion }
    ];

    setResultados({
      potenciaRequerida,
      numeroPaneles,
      ahorroAnual,
      retornoInversion,
      comparativaFinanciera
    });
  }, [values]);

  const escenarios = useMemo(() => {
    if (!resultados) return [];
    
    return [
      { name: 'Base', retorno: resultados.retornoInversion },
      { name: '+20% electricidad', retorno: resultados.retornoInversion * 0.8 }, 
      { name: '-20% electricidad', retorno: resultados.retornoInversion * 1.2 }, 
      { name: '+20% eficiencia', retorno: resultados.retornoInversion * 0.9 },
      { name: '-20% inversion', retorno: resultados.retornoInversion * 0.8 }
    ];
  }, [resultados]);

  const reiniciar = useCallback(() => {
    setValues({
      consumoMensual: '',
      horasSol: '',
      inversionInicial: '',
      precioElectricidad: '',
      eficienciaPaneles: '20',
      vidaUtil: '25'
    });
    setErrors({});
    setResultados(null);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card className="dark:bg-gray-800 shadow-lg" role="region" aria-label="Simulador de energía solar">
        <CardHeader className="bg-blue-50 dark:bg-gray-700 pb-2 rounded-t-lg">
          <CardTitle className="text-xl text-center text-blue-800 dark:text-blue-200">
            Simulador Personalizado de Energía Solar
          </CardTitle>
          <CardDescription className="text-center text-blue-600 dark:text-blue-300">
            Ingrese sus datos de consumo y tarifa para calcular el potencial de ahorro
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form 
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              calcular();
            }}
            className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg mb-6 shadow-lg"
            aria-label="Formulario de simulación"
            data-testid="simulador-form"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5 text-center">
              📋 Complete los campos requeridos
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Consumo Mensual */}
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="consumoMensual"
                      className="block text-sm font-bold text-gray-700 dark:text-gray-200"
                    >
                      Consumo mensual (kWh) *
                    </label>
                    <Tooltip content="El consumo mensual típico de un hogar está entre 150-300 kWh">
                      <span className="text-gray-500 cursor-help" aria-hidden="true">ℹ️</span>
                    </Tooltip>
                  </div>
                  <input
                    type="number"
                    id="consumoMensual"
                    name="consumoMensual"
                    value={values.consumoMensual}
                    onChange={handleChange}
                    placeholder="Ej: 250"
                    className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white"
                    aria-required="true"
                    aria-describedby="consumoMensual-error consumoMensual-hint"
                    aria-invalid={!!errors.consumoMensual}
                    min="0"
                    max="5000"
                    data-testid="input-consumo-mensual"
                  />
                  <p id="consumoMensual-hint" className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    El consumo mensual típico de un hogar está entre 150-300 kWh
                  </p>
                  {errors.consumoMensual && (
                    <p id="consumoMensual-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.consumoMensual}
                    </p>
                  )}
                </div>
                
                {/* Tarifa de Energía */}
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border-l-4 border-orange-500">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="precioElectricidad"
                      className="block text-sm font-bold text-gray-700 dark:text-gray-200"
                    >
                      Tarifa de energía (COP/kWh) *
                    </label>
                    <Tooltip content="Puede encontrar este valor en su factura de energía">
                      <span className="text-gray-500 cursor-help" aria-hidden="true">ℹ️</span>
                    </Tooltip>
                  </div>
                  <input
                    type="number"
                    id="precioElectricidad"
                    name="precioElectricidad"
                    value={values.precioElectricidad}
                    onChange={handleChange}
                    placeholder="Ej: 454"
                    className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-800 border-2 border-orange-500 dark:border-orange-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white"
                    aria-required="true"
                    aria-describedby="precioElectricidad-error precioElectricidad-hint"
                    aria-invalid={!!errors.precioElectricidad}
                    min="300"
                    max="1000"
                    data-testid="input-precio-electricidad"
                  />
                  <p id="precioElectricidad-hint" className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Puede encontrar este valor en su factura de energía
                  </p>
                  {errors.precioElectricidad && (
                    <p id="precioElectricidad-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.precioElectricidad}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Horas de Sol */}
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
                  <label
                    htmlFor="horasSol"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-200"
                  >
                    Horas de sol promedio por día *
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                    Valor típico en Colombia: 4-6 horas/día
                  </p>
                  <input
                    type="number"
                    step="0.1"
                    id="horasSol"
                    name="horasSol"
                    value={values.horasSol}
                    onChange={handleChange}
                    placeholder="Ej: 5"
                    className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-800 border-2 border-yellow-500 dark:border-yellow-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white"
                    required
                    aria-invalid={!!errors.horasSol}
                    data-testid="input-horas-sol"
                  />
                  {errors.horasSol && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.horasSol}
                    </p>
                  )}
                </div>

                {/* Inversión Inicial */}
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md border-l-4 border-purple-500">
                  <label
                    htmlFor="inversionInicial"
                    className="block text-sm font-bold text-gray-700 dark:text-gray-200"
                  >
                    Inversión inicial (COP) *
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                    Costo estimado del sistema: 9-16 millones COP
                  </p>
                  <input
                    type="number"
                    id="inversionInicial"
                    name="inversionInicial"
                    value={values.inversionInicial}
                    onChange={handleChange}
                    placeholder="Ej: 9500000"
                    className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-white"
                    required
                    aria-invalid={!!errors.inversionInicial}
                    data-testid="input-inversion-inicial"
                  />
                  {errors.inversionInicial && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.inversionInicial}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-6 justify-center mt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  aria-label="Calcular simulación"
                  data-testid="btn-calcular"
                >
                  🧮 Calcular
                </button>
                <button
                  type="button"
                  onClick={reiniciar}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-base font-medium rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  aria-label="Reiniciar formulario"
                  data-testid="btn-reiniciar"
                >
                  🔄 Reiniciar
                </button>
              </div>
            </div>
          </form>
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400" role="note">
            <p>* Campos obligatorios</p>
          </div>
        </CardContent>
      </Card>

      {resultados && (
        <div 
          className="space-y-6" 
          data-testid="resultado-calculo"
          ref={resultadosRef}
          tabIndex={-1}
          role="region"
          aria-label="Resultados de la simulación"
        >
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">Resultados de la simulación</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Basado en un consumo de {values.consumoMensual} kWh y tarifa de {values.precioElectricidad} COP/kWh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-100">Datos técnicos:</h3>
                  <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                    <li className="flex items-center">
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      <span>Potencia requerida: <span className="font-semibold">{Math.round(resultados.potenciaRequerida)} W</span></span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      <span>Número aproximado de paneles: <span className="font-semibold">{resultados.numeroPaneles}</span></span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                      <span>Ahorro mensual estimado: <span className="font-semibold">{formatCurrency(Math.round(resultados.ahorroAnual / 12))}</span></span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                      <span>Ahorro anual estimado: <span className="font-semibold">{formatCurrency(Math.round(resultados.ahorroAnual))}</span></span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      <span>Tiempo de recuperación de inversión: <span className="font-semibold">{resultados.retornoInversion.toFixed(1)} años</span></span>
                    </li>
                  </ul>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={escenarios} className="dark:text-gray-100">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="#CBD5E0" className="dark:text-gray-100" />
                      <YAxis label={{ value: 'Años', angle: -90, position: 'insideLeft' }} stroke="#CBD5E0" />
                      <RechartsTooltip formatter={(value: any) => [`${value.toFixed(1)} años`, 'Tiempo de recuperación']} />
                      <Bar dataKey="retorno" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">Estructura financiera</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Análisis comparativo de costos y ahorros a 10 años
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resultados.comparativaFinanciera}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, value}: {name: string, value: number}) => `${name}: ${formatCurrency(value)}`}
                      >
                        {resultados.comparativaFinanciera.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: any) => [formatCurrency(value), '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex flex-col justify-center">
                  <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-100">Resumen del análisis financiero:</h4>
                  <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                    <li className="flex items-center">
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      <span>Inversión inicial: <span className="font-semibold">{formatCurrency(parseFloat(values.inversionInicial))}</span></span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      <span>Ahorro total en 10 años: <span className="font-semibold">{formatCurrency(resultados.ahorroAnual * 10)}</span></span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                      <span>Ganancia neta en 10 años: <span className="font-semibold">{formatCurrency(resultados.ahorroAnual * 10 - parseFloat(values.inversionInicial) * 1.3)}</span></span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                      <span>Ganancia neta durante vida útil: <span className="font-semibold">{formatCurrency(resultados.ahorroAnual * parseFloat(values.vidaUtil) - parseFloat(values.inversionInicial) * 1.5)}</span></span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SimuladorPersonalizado;