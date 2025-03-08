import React, { useState, useCallback, memo, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import ContinueDialog from './ui/ContinueDialog';
import styles from './DecisionGuide.module.css';

// Componente para anuncios de accesibilidad
const LiveRegion = memo(({ message }: { message: string }) => (
  <div 
    className="sr-only" 
    role="status" 
    aria-live="polite" 
    aria-atomic="true"
  >
    {message}
  </div>
));

// Resto de interfaces
interface Pregunta {
  id: number;
  texto: string;
  descripcion?: string;
  opciones: {
    texto: string;
    puntaje: {
      redElectrica: number;
      panelesSolares: number;
      generadorGas: number;
    };
  }[];
}

interface Recomendacion {
  tipo: 'redElectrica' | 'panelesSolares' | 'generadorGas';
  titulo: string;
  descripcion: string;
  ventajas: string[];
  consideraciones: string[];
}

// Lista completa de preguntas del asistente
const preguntas: Pregunta[] = [
  {
    id: 1,
    texto: "¿Cuál es su consumo mensual promedio de energía?",
    descripcion: "El consumo promedio afecta directamente la rentabilidad de cada alternativa energética.",
    opciones: [
      {
        texto: "Bajo (menos de 150 kWh)",
        puntaje: { redElectrica: 3, panelesSolares: 1, generadorGas: 1 }
      },
      {
        texto: "Medio (150-300 kWh)",
        puntaje: { redElectrica: 2, panelesSolares: 3, generadorGas: 2 }
      },
      {
        texto: "Alto (más de 300 kWh)",
        puntaje: { redElectrica: 1, panelesSolares: 3, generadorGas: 2 }
      }
    ]
  },
  {
    id: 2,
    texto: "¿Cuál es su presupuesto inicial disponible?",
    descripcion: "Las diferentes alternativas requieren distintos niveles de inversión inicial.",
    opciones: [
      {
        texto: "Limitado (menos de $3,000)",
        puntaje: { redElectrica: 3, panelesSolares: 0, generadorGas: 1 }
      },
      {
        texto: "Moderado ($3,000 - $8,000)",
        puntaje: { redElectrica: 2, panelesSolares: 2, generadorGas: 3 }
      },
      {
        texto: "Amplio (más de $8,000)",
        puntaje: { redElectrica: 1, panelesSolares: 3, generadorGas: 2 }
      }
    ]
  },
  {
    id: 3,
    texto: "¿Cuál es la prioridad principal para su sistema energético?",
    opciones: [
      {
        texto: "Ahorro económico a largo plazo",
        puntaje: { redElectrica: 1, panelesSolares: 3, generadorGas: 1 }
      },
      {
        texto: "Confiabilidad y disponibilidad constante",
        puntaje: { redElectrica: 2, panelesSolares: 1, generadorGas: 3 }
      },
      {
        texto: "Impacto ambiental reducido",
        puntaje: { redElectrica: 1, panelesSolares: 3, generadorGas: 0 }
      }
    ]
  },
  {
    id: 4,
    texto: "¿Cómo describiría las condiciones de sol en su ubicación?",
    opciones: [
      {
        texto: "Excelentes (más de 5 horas de sol pleno diarias)",
        puntaje: { redElectrica: 1, panelesSolares: 3, generadorGas: 1 }
      },
      {
        texto: "Moderadas (3-5 horas de sol pleno diarias)",
        puntaje: { redElectrica: 2, panelesSolares: 2, generadorGas: 2 }
      },
      {
        texto: "Limitadas (menos de 3 horas de sol pleno diarias)",
        puntaje: { redElectrica: 3, panelesSolares: 1, generadorGas: 3 }
      }
    ]
  },
  {
    id: 5,
    texto: "¿Dispone de espacio adecuado para la instalación de equipos?",
    descripcion: "Los paneles solares requieren espacio en tejados o terrenos, mientras que los generadores necesitan ventilación.",
    opciones: [
      {
        texto: "Amplio espacio disponible (tejado grande o terreno)",
        puntaje: { redElectrica: 2, panelesSolares: 3, generadorGas: 3 }
      },
      {
        texto: "Espacio moderado (tejado pequeño)",
        puntaje: { redElectrica: 2, panelesSolares: 2, generadorGas: 2 }
      },
      {
        texto: "Espacio muy limitado",
        puntaje: { redElectrica: 3, panelesSolares: 0, generadorGas: 1 }
      }
    ]
  },
  {
    id: 6,
    texto: "¿Cuál es la calidad del servicio eléctrico en su zona?",
    opciones: [
      {
        texto: "Muy confiable (casi sin interrupciones)",
        puntaje: { redElectrica: 3, panelesSolares: 1, generadorGas: 1 }
      },
      {
        texto: "Moderada (interrupciones ocasionales)",
        puntaje: { redElectrica: 2, panelesSolares: 2, generadorGas: 2 }
      },
      {
        texto: "Poco confiable (interrupciones frecuentes)",
        puntaje: { redElectrica: 0, panelesSolares: 3, generadorGas: 3 }
      }
    ]
  },
  {
    id: 7,
    texto: "¿Cuánto tiempo planea permanecer en su ubicación actual?",
    descripcion: "El periodo de retorno de inversión varía según la alternativa energética.",
    opciones: [
      {
        texto: "Corto plazo (menos de 5 años)",
        puntaje: { redElectrica: 3, panelesSolares: 0, generadorGas: 2 }
      },
      {
        texto: "Mediano plazo (5-10 años)",
        puntaje: { redElectrica: 2, panelesSolares: 2, generadorGas: 2 }
      },
      {
        texto: "Largo plazo (más de 10 años)",
        puntaje: { redElectrica: 1, panelesSolares: 3, generadorGas: 1 }
      }
    ]
  },
];

// Recomendaciones detalladas según la opción seleccionada
const recomendaciones: Record<string, Recomendacion> = {
  redElectrica: {
    tipo: 'redElectrica',
    titulo: 'Red Eléctrica Convencional',
    descripcion: 'El sistema de red eléctrica tradicional es la opción más adecuada para su situación. Esta alternativa ofrece simplicidad y no requiere inversión inicial significativa.',
    ventajas: [
      'Sin inversión inicial significativa',
      'Disponibilidad inmediata sin instalación',
      'Mantenimiento a cargo de la compañía eléctrica',
      'Capacidad ilimitada según sus necesidades'
    ],
    consideraciones: [
      'El costo puede aumentar con el tiempo debido a la inflación y políticas tarifarias',
      'Dependencia total del suministro público',
      'Mayor huella de carbono comparado con energías renovables',
      'Sin protección contra cortes de energía'
    ]
  },
  panelesSolares: {
    tipo: 'panelesSolares',
    titulo: 'Sistema Fotovoltaico (Paneles Solares)',
    descripcion: 'Un sistema de energía solar es la mejor opción para sus necesidades. Esta alternativa ofrece independencia energética y excelente retorno de inversión a largo plazo.',
    ventajas: [
      'Ahorro significativo a largo plazo',
      'Energía limpia y renovable con mínimo impacto ambiental',
      'Independencia energética parcial o total',
      'Aumento del valor de la propiedad',
      'Posibilidad de vender excedentes a la red'
    ],
    consideraciones: [
      'Inversión inicial considerable',
      'Desempeño variable según condiciones climáticas',
      'Requiere espacio adecuado para la instalación',
      'Necesita mantenimiento periódico',
      'Puede requerir baterías para independencia total (costo adicional)'
    ]
  },
  generadorGas: {
    tipo: 'generadorGas',
    titulo: 'Generador a Gas/Combustible',
    descripcion: 'Un sistema basado en generadores es la mejor alternativa para su situación particular. Esta opción ofrece confiabilidad y flexibilidad en condiciones variables.',
    ventajas: [
      'Confiabilidad en cualquier condición climática',
      'Independencia total de la red eléctrica',
      'Inversión inicial moderada',
      'Capacidad de ajuste según demanda',
      'Instalación relativamente sencilla'
    ],
    consideraciones: [
      'Costo operativo continuo (combustible)',
      'Mayor huella de carbono y emisiones locales',
      'Requiere mantenimiento regular',
      'Genera ruido durante su funcionamiento',
      'Vida útil limitada comparada con paneles solares'
    ]
  }
};

const DecisionGuide: React.FC = () => {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [puntajes, setPuntajes] = useState({
    redElectrica: 0,
    panelesSolares: 0,
    generadorGas: 0
  });
  const [showDialog, setShowDialog] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<{ paso: number; opcion: number } | null>(null);
  // Estado para anuncios de accesibilidad
  const [announcement, setAnnouncement] = useState('');
  
  // Referencias para manejo de foco
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const resultadosRef = useRef<HTMLDivElement>(null);
  const iniciarButtonRef = useRef<HTMLButtonElement>(null);
  const opcionesRef = useRef<(HTMLInputElement | null)[]>([]);
  
  // Efecto para manejar el foco cuando cambia el paso
  useEffect(() => {
    if (paso === 0 && iniciarButtonRef.current) {
      iniciarButtonRef.current.focus();
    } else if (paso > preguntas.length && resultadosRef.current) {
      resultadosRef.current.focus();
      setAnnouncement('Mostrando resultados del asistente con tu recomendación personalizada');
    } else if (paso > 0 && paso <= preguntas.length) {
      setAnnouncement(`Pregunta ${paso} de ${preguntas.length}: ${preguntas[paso - 1].texto}`);
      // Dar tiempo para que el DOM se actualice
      setTimeout(() => {
        const firstOption = document.querySelector(`input[name="pregunta-${paso}"]`) as HTMLElement;
        if (firstOption) firstOption.focus();
      }, 100);
    }
  }, [paso]);

  const actualizarPuntajes = useCallback((preguntaIndex: number, opcionIndex: number) => {
    setPuntajes(prev => {
      const puntajeOpcion = preguntas[preguntaIndex].opciones[opcionIndex].puntaje;
      return {
        redElectrica: prev.redElectrica + puntajeOpcion.redElectrica,
        panelesSolares: prev.panelesSolares + puntajeOpcion.panelesSolares,
        generadorGas: prev.generadorGas + puntajeOpcion.generadorGas
      };
    });
  }, []);

  // Manejar selección de respuesta
  const handleSeleccion = useCallback((pasoActual: number, opcionIndex: number) => {
    setRespuestas(prev => {
      const newRespuestas = [...prev];
      newRespuestas[pasoActual] = opcionIndex;
      return newRespuestas;
    });
    
    actualizarPuntajes(pasoActual, opcionIndex);
    
    // Avanzar directamente al siguiente paso
    setPaso(p => p + 1);
    if (pasoActual === preguntas.length - 1) {
      setAnnouncement('Procesando tus respuestas para generar recomendaciones');
    } else {
      setAnnouncement(`Avanzando a la pregunta ${pasoActual + 2} de ${preguntas.length}`);
    }
  }, [actualizarPuntajes, preguntas.length]);

  // Teclado: mover entre opciones con flechas
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, currentPaso: number) => {
    const radioInputs = Array.from(document.querySelectorAll(`input[name="pregunta-${currentPaso}"]`)) as HTMLInputElement[];
    const currentIndex = radioInputs.findIndex(input => input === document.activeElement);
    
    if (currentIndex !== -1) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) radioInputs[currentIndex - 1].focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < radioInputs.length - 1) radioInputs[currentIndex + 1].focus();
          break;
      }
    }
  }, []);

  // Determinar la mejor opción
  const mejorOpcion = useMemo(() => {
    const opciones = [
      { nombre: 'redElectrica', valor: puntajes.redElectrica },
      { nombre: 'panelesSolares', valor: puntajes.panelesSolares },
      { nombre: 'generadorGas', valor: puntajes.generadorGas }
    ];
    return opciones.reduce((prev, current) => 
      (current.valor > prev.valor) ? current : prev
    , { nombre: '', valor: -1 });
  }, [puntajes]);

  // Calcular porcentajes de compatibilidad
  const porcentajes = useMemo(() => {
    if (paso <= 0) return { redElectrica: 0, panelesSolares: 0, generadorGas: 0 };
    
    const maxPosible = preguntas.length * 3; // Puntaje máximo posible
    
    return {
      redElectrica: Math.round((puntajes.redElectrica / maxPosible) * 100),
      panelesSolares: Math.round((puntajes.panelesSolares / maxPosible) * 100),
      generadorGas: Math.round((puntajes.generadorGas / maxPosible) * 100)
    };
  }, [puntajes, paso]);

  // Datos para gráficos de radar y barras
  const datosRadar = useMemo(() => {
    // Solo mostrar radar con al menos una respuesta
    if (respuestas.length === 0) return [];
    
    return [
      { categoria: 'Económico', redElectrica: 70, panelesSolares: 40, generadorGas: 60 },
      { categoria: 'Ambiental', redElectrica: 40, panelesSolares: 90, generadorGas: 30 },
      { categoria: 'Confiabilidad', redElectrica: 60, panelesSolares: 50, generadorGas: 80 },
      { categoria: 'Independencia', redElectrica: 20, panelesSolares: 80, generadorGas: 90 },
      { categoria: 'Mantenimiento', redElectrica: 90, panelesSolares: 60, generadorGas: 50 }
    ];
  }, [respuestas]);

  const datosBarras = useMemo(() => {
    return [
      { nombre: 'Red Eléctrica', compatibilidad: porcentajes.redElectrica },
      { nombre: 'Paneles Solares', compatibilidad: porcentajes.panelesSolares },
      { nombre: 'Generador a Gas', compatibilidad: porcentajes.generadorGas }
    ];
  }, [porcentajes]);

  // Reiniciar el asistente
  const reiniciarAsistente = useCallback(() => {
    setPaso(0);
    setRespuestas([]);
    setPuntajes({
      redElectrica: 0,
      panelesSolares: 0,
      generadorGas: 0
    });
    setAnnouncement('Asistente reiniciado. Volviendo a la pantalla inicial.');
  }, []);

  // Gestionar navegación al simulador
  const navegarAlSimulador = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const tabElement = document.querySelector('[aria-controls="panel-simulador"]');
    if (tabElement && tabElement instanceof HTMLElement) {
      tabElement.click();
      setAnnouncement('Navegando al simulador personalizado');
    }
  }, []);

  // Generar descripción textual para los gráficos (accesibilidad)
  const generarDescripcionGrafico = useMemo(() => {
    if (paso <= preguntas.length) return '';
    
    const mejorSistema = recomendaciones[mejorOpcion.nombre]?.titulo || '';
    const descripcionBarras = datosBarras
      .map(item => `${item.nombre}: ${item.compatibilidad}% de compatibilidad`)
      .join('. ');
    
    return `Resultados: ${mejorSistema} es la opción más compatible con tus necesidades. ${descripcionBarras}.`;
  }, [datosBarras, mejorOpcion.nombre, paso]);

  return (
    <div className="space-y-6">
      {/* Región para anuncios de accesibilidad */}
      <LiveRegion message={announcement || generarDescripcionGrafico} />
      
      <Card className="w-full bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Asistente de Toma de Decisiones
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Te ayudamos a elegir la mejor alternativa energética según tus necesidades específicas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {paso === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                ¿No sabes qué alternativa energética es mejor para ti?
              </h3>
              <p className="mb-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Este asistente te ayudará a determinar la mejor opción energética para tu caso específico 
                a través de una serie de preguntas sobre tus necesidades, presupuesto y circunstancias.
                Al final, recibirás una recomendación personalizada con análisis detallado.
              </p>
              <button
                ref={iniciarButtonRef}
                onClick={() => setPaso(1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Iniciar el asistente de decisión"
              >
                Iniciar Asistente
              </button>
            </div>
          ) : paso <= preguntas.length ? (
            <div 
              role="form" 
              aria-label={`Pregunta ${paso} de ${preguntas.length}`} 
              className="max-w-3xl mx-auto"
              onKeyDown={(e) => handleKeyDown(e, paso)}
            >
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Pregunta {paso} de {preguntas.length}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.round((paso / preguntas.length) * 100)}% completado
                  </span>
                </div>
                
                {/* Barra de progreso */}
                <div 
                  className={styles.progressBarContainer}
                  role="progressbar"
                  aria-label="Progreso del cuestionario"
                  aria-valuenow={Math.floor((paso / preguntas.length) * 100)}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <style>
                    {`:root { --progress-width: ${Math.floor((paso / preguntas.length) * 100)}%; }`}
                  </style>
                  <div className={styles.progressBar} />
                </div>
                
                <h4 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
                  {preguntas[paso - 1].texto}
                </h4>
                
                {preguntas[paso - 1].descripcion && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {preguntas[paso - 1].descripcion}
                  </p>
                )}
              </div>
              
              <fieldset className="space-y-4">
                <legend className="sr-only">Opciones de respuesta para pregunta {paso}</legend>
                {preguntas[paso - 1].opciones.map((opcion, index) => (
                  <label
                    key={index}
                    className={`
                      flex items-center p-4 border rounded-lg cursor-pointer 
                      hover:bg-gray-50 dark:hover:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500
                      transition-colors
                      ${respuestas[paso - 1] === index ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-600'}
                    `}
                    tabIndex={-1}
                  >
                    <input
                      type="radio"
                      name={`pregunta-${paso}`}
                      value={index}
                      id={`pregunta-${paso}-opcion-${index}`}
                      checked={respuestas[paso - 1] === index}
                      onChange={() => handleSeleccion(paso - 1, index)}
                      className="w-4 h-4 text-blue-600"
                      ref={el => { 
                        if (opcionesRef.current.length <= index) {
                          opcionesRef.current.push(el);
                        } else {
                          opcionesRef.current[index] = el;
                        }
                      }}
                      tabIndex={0}
                      aria-label={opcion.texto}
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">
                      {opcion.texto}
                    </span>
                  </label>
                ))}
              </fieldset>
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => {
                    if (paso > 1) {
                      setPaso(p => p - 1);
                      setAnnouncement(`Regresando a la pregunta ${paso - 1} de ${preguntas.length}`);
                    } else {
                      reiniciarAsistente();
                    }
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label={paso > 1 ? "Regresar a la pregunta anterior" : "Regresar al inicio"}
                >
                  {paso > 1 ? 'Anterior' : 'Cancelar'}
                </button>
                
                <button
                  onClick={() => {
                    if (respuestas[paso - 1] !== undefined) {
                      setPaso(p => p + 1);
                      if (paso === preguntas.length) {
                        setAnnouncement('Procesando tus respuestas para generar recomendaciones');
                      }
                    }
                  }}
                  disabled={respuestas[paso - 1] === undefined}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label={paso === preguntas.length ? "Ver resultados" : "Siguiente pregunta"}
                >
                  {paso === preguntas.length ? 'Ver Resultados' : 'Siguiente'}
                </button>
              </div>
            </div>
          ) : (
            <div 
              role="region" 
              aria-label="Resultados del asistente" 
              ref={resultadosRef} 
              tabIndex={-1}
            >
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">
                Resultados de tu Evaluación Personalizada
              </h3>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg mb-8 text-center">
                <p className="text-lg text-blue-900 dark:text-blue-100">
                  Basado en tus respuestas, la mejor opción para ti es:
                </p>
                <h4 className="text-3xl font-bold text-blue-600 dark:text-blue-300 mt-2">
                  {recomendaciones[mejorOpcion.nombre]?.titulo || 'Analizando...'}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Compatibilidad con tus necesidades
                  </h4>
                  <div className={styles.chartContainer} aria-hidden="true">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={datosBarras}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="nombre" type="category" width={100} />
                        <RechartsTooltip formatter={(value) => [`${value}% compatibilidad`, '']} />
                        <Legend />
                        <Bar 
                          dataKey="compatibilidad" 
                          name="Compatibilidad (%)" 
                          fill="#0088FE" 
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Descripción textual accesible del gráfico */}
                  <div className="sr-only">
                    <h5>Descripción de la gráfica de compatibilidad</h5>
                    <ul>
                      {datosBarras.map((item, index) => (
                        <li key={index}>
                          {item.nombre}: {item.compatibilidad}% de compatibilidad
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Análisis por categorías
                  </h4>
                  <div className={styles.chartContainer} aria-hidden="true">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={datosRadar}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="categoria" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Red Eléctrica"
                          dataKey="redElectrica"
                          stroke="#0088FE"
                          fill="#0088FE"
                          fillOpacity={0.6}
                        />
                        <Radar
                          name="Paneles Solares"
                          dataKey="panelesSolares"
                          stroke="#00C49F"
                          fill="#00C49F"
                          fillOpacity={0.6}
                        />
                        <Radar
                          name="Generador a Gas"
                          dataKey="generadorGas"
                          stroke="#FF8042"
                          fill="#FF8042"
                          fillOpacity={0.6}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Descripción textual accesible del gráfico */}
                  <div className="sr-only">
                    <h5>Análisis por categorías en porcentaje</h5>
                    <p>Comparación de los tres sistemas de energía en cinco categorías:</p>
                    <ul>
                      {datosRadar.map((item, i) => (
                        <li key={i}>
                          {item.categoria}: Red Eléctrica {item.redElectrica}%,
                          Paneles Solares {item.panelesSolares}%,
                          Generador a Gas {item.generadorGas}%
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {mejorOpcion.nombre && (
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8">
                  <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Recomendación detallada
                  </h4>
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    {recomendaciones[mejorOpcion.nombre].descripcion}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h5 className="text-lg font-bold text-green-700 dark:text-green-400 mb-2">Ventajas principales</h5>
                      <ul className="space-y-1 list-disc pl-5">
                        {recomendaciones[mejorOpcion.nombre].ventajas.map((ventaja, index) => (
                          <li key={`ventaja-${index}`} className="text-gray-600 dark:text-gray-300">
                            {ventaja}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-lg font-bold text-amber-700 dark:text-amber-400 mb-2">Consideraciones importantes</h5>
                      <ul className="space-y-1 list-disc pl-5">
                        {recomendaciones[mejorOpcion.nombre].consideraciones.map((consideracion, index) => (
                          <li key={`consideracion-${index}`} className="text-gray-600 dark:text-gray-300">
                            {consideracion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  onClick={reiniciarAsistente}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  aria-label="Reiniciar el asistente"
                >
                  Comenzar de Nuevo
                </button>
                
                <a
                  href="#simulador"
                  onClick={navegarAlSimulador}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
                  role="button"
                >
                  Ir al Simulador
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(DecisionGuide);