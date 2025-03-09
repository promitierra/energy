import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Datos de sistemas de generación de energía
const energySystems = [
  { 
    name: 'Solar Fotovoltaico', 
    x: 85, 
    y: 90, 
    z: 60, 
    emissions: 5, 
    scalability: 75, 
    reliability: 65, 
    cluster: 'Renovables'
  },
  { 
    name: 'Eólico Terrestre', 
    x: 75, 
    y: 85, 
    z: 70, 
    emissions: 10,
    scalability: 80,
    reliability: 70,
    cluster: 'Renovables'
  },
  { 
    name: 'Carbón', 
    x: 40, 
    y: 20, 
    z: 30, 
    emissions: 820,
    scalability: 90,
    reliability: 85,
    cluster: 'Fósiles'
  },
  { 
    name: 'Nuclear', 
    x: 90, 
    y: 50, 
    z: 80, 
    emissions: 12,
    scalability: 95,
    reliability: 95,
    cluster: 'Bajas Emisiones'
  },
  { 
    name: 'Gas Natural', 
    x: 60, 
    y: 45, 
    z: 50, 
    emissions: 490,
    scalability: 85,
    reliability: 80,
    cluster: 'Fósiles'
  },
  { 
    name: 'Hidroeléctrica', 
    x: 80, 
    y: 75, 
    z: 65, 
    emissions: 24,
    scalability: 70,
    reliability: 75,
    cluster: 'Renovables'
  },
  { 
    name: 'Biomasa', 
    x: 65, 
    y: 70, 
    z: 55, 
    emissions: 230,
    scalability: 60,
    reliability: 60,
    cluster: 'Renovables'
  },
  { 
    name: 'Solar Concentrado', 
    x: 70, 
    y: 80, 
    z: 75, 
    emissions: 27,
    scalability: 65,
    reliability: 55,
    cluster: 'Renovables'
  },
  { 
    name: 'Geotérmica', 
    x: 80, 
    y: 85, 
    z: 80, 
    emissions: 38,
    scalability: 50,
    reliability: 90,
    cluster: 'Renovables'
  }
];

const EnergySystemsScatterPlot = () => {
  // Estados para controlar la visualización y el modo oscuro
  const [xAxis, setXAxis] = useState('x');
  const [yAxis, setYAxis] = useState('y');
  const [showAllClusters, setShowAllClusters] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Usar preferencia de sistema para modo oscuro
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDarkMode);
  }, []);

  // Mapeo de ejes a etiquetas
  const axisLabels = {
    x: 'Eficiencia (%)',
    y: 'Sostenibilidad Ambiental (%)',
    z: 'Costo de Instalación',
    emissions: 'Emisiones CO2 (g/kWh)',
    scalability: 'Potencial de Escalabilidad (%)',
    reliability: 'Confiabilidad (%)'
  };

  // Paleta de colores adaptativa
  const clusterColors = isDarkMode 
    ? {
        'Renovables': '#4CAF50',
        'Fósiles': '#FF6B6B',
        'Bajas Emisiones': '#4ECDC4'
      }
    : {
        'Renovables': '#4CAF50',
        'Fósiles': '#F44336',
        'Bajas Emisiones': '#2196F3'
      };

  // Filtrar sistemas por cluster seleccionado
  const filteredSystems = selectedCluster && !showAllClusters
    ? energySystems.filter(system => system.cluster === selectedCluster)
    : energySystems;

  // Estilos dinámicos según modo
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const selectBgColor = isDarkMode ? 'bg-gray-700' : 'bg-white';
  const selectTextColor = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <div className={`p-4 rounded-lg shadow-2xl transition-colors duration-300 ${bgColor} ${textColor}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-bold ${textColor}`}>
          Análisis de Sistemas de Generación de Energía
        </h2>
        
        {/* Toggle Modo Oscuro */}
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${textColor}`}>
            {isDarkMode ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
          </span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      
      {/* Controles de ejes */}
      <div className={`mb-4 flex space-x-4 ${textColor}`}>
        <div>
          <label className="block text-sm font-medium">Eje X</label>
          <select 
            value={xAxis} 
            onChange={(e) => setXAxis(e.target.value)}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md 
              ${selectBgColor} ${selectTextColor} 
              border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {Object.keys(axisLabels).map(key => (
              <option key={key} value={key}>{axisLabels[key]}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium">Eje Y</label>
          <select 
            value={yAxis} 
            onChange={(e) => setYAxis(e.target.value)}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md 
              ${selectBgColor} ${selectTextColor} 
              border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {Object.keys(axisLabels).map(key => (
              <option key={key} value={key}>{axisLabels[key]}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            checked={showAllClusters}
            onChange={() => setShowAllClusters(!showAllClusters)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className={`text-sm ${textColor}`}>Mostrar Todos los Clusters</label>
        </div>
      </div>

      {/* Botones de selección de cluster */}
      <div className="mb-4 flex space-x-2">
        {Object.keys(clusterColors).map((cluster) => (
          <button
            key={cluster}
            onClick={() => {
              setSelectedCluster(selectedCluster === cluster ? null : cluster);
              setShowAllClusters(false);
            }}
            className={`px-3 py-1 rounded transition-all duration-300 ${
              selectedCluster === cluster 
                ? 'bg-blue-500 text-white' 
                : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
            }`}
          >
            {cluster}
          </button>
        ))}
      </div>

      {/* Gráfico de dispersión */}
      <ResponsiveContainer width="100%" height={600}>
        <ScatterChart>
          <CartesianGrid 
            stroke={gridColor} 
            strokeDasharray="3 3" 
          />
          <XAxis 
            type="number" 
            dataKey={xAxis} 
            name={axisLabels[xAxis]} 
            unit="%" 
            tick={{ fill: isDarkMode ? 'white' : 'black' }}
          />
          <YAxis 
            type="number" 
            dataKey={yAxis} 
            name={axisLabels[yAxis]} 
            unit="%" 
            tick={{ fill: isDarkMode ? 'white' : 'black' }}
          />
          <ZAxis 
            type="number" 
            dataKey="z" 
            name="Costo de Instalación" 
            range={[0, 500]}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: isDarkMode ? '#333' : 'white',
              color: isDarkMode ? 'white' : 'black',
              borderRadius: '8px'
            }}
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value, name, props) => {
              if (name === 'payload') {
                const system = props.payload;
                return [
                  `Nombre: ${system.name}
                  Eficiencia: ${system.x}%
                  Sostenibilidad: ${system.y}%
                  Costo Instalación: ${system.z} (escala)
                  Emisiones CO2: ${system.emissions} g/kWh
                  Escalabilidad: ${system.scalability}%
                  Confiabilidad: ${system.reliability}%
                  Cluster: ${system.cluster}`
                ];
              }
              return [value, name];
            }}
          />
          <Legend 
            iconType="circle"
            wrapperStyle={{ color: isDarkMode ? 'white' : 'black' }}
          />
          {Object.keys(clusterColors).map((cluster) => (
            <Scatter
              key={cluster}
              name={cluster}
              data={filteredSystems.filter(system => system.cluster === cluster)}
              fill={clusterColors[cluster]}
              fillOpacity={0.7}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Estilos para toggle de modo oscuro */}
      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: ${isDarkMode ? '#4a5568' : '#ccc'};
          transition: .4s;
          border-radius: 34px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
          transform: ${isDarkMode ? 'translateX(26px)' : 'translateX(0)'};
        }
      `}</style>
    </div>
  );
};

export default EnergySystemsScatterPlot;
