# Guía de Carga de Datos de Emisiones

## Descripción General
Esta guía explica cómo utilizar el mecanismo de carga de datos de emisiones y cómo migrar datos de emisiones codificados directamente al formato JSON.

## Uso del Cargador de Emisiones

### Uso Básico
El cargador de emisiones proporciona varias funciones para acceder a los datos de emisiones desde el archivo JSON:

```typescript
import { loadEmissionsData, getEnergySourceByName, getEnergySourcesByType, getConversionFactor } from '../utils/emissionsLoader';

// Cargar todos los datos de emisiones
const emissionsData = loadEmissionsData();

// Acceder a fuentes de energía y factores de conversión
const energySources = emissionsData.energySources;
const conversionFactors = emissionsData.conversionFactors;

// Obtener una fuente de energía específica por nombre
const solarPV = getEnergySourceByName('Solar PV');

// Obtener todas las fuentes de energía de un tipo específico
const renewableSources = getEnergySourcesByType('renewable');

// Obtener un factor de conversión específico
const kwhToMwh = getConversionFactor('kWh', 'MWh');
```

### Manejo de Errores
El cargador de emisiones incluye un manejo de errores robusto:

```typescript
try {
  const emissionsData = loadEmissionsData();
  // Procesar datos de emisiones
} catch (error) {
  console.error('Error al cargar datos de emisiones:', error);
  // Implementar mecanismo de respaldo o mostrar error amigable al usuario
}
```

## Migración de Datos Codificados Directamente a JSON

### Antes de la Migración (Codificación Directa)

```typescript
// Enfoque antiguo con datos de emisiones codificados directamente
const ENERGY_SOURCES = [
  {
    name: 'Solar PV',
    type: 'renewable',
    co2PerKWh: 41,
    lifecycleEmissions: 6,
    conversionEfficiency: 20
  },
  {
    name: 'Wind',
    type: 'renewable',
    co2PerKWh: 11,
    lifecycleEmissions: 4,
    conversionEfficiency: 45
  },
  {
    name: 'Natural Gas',
    type: 'fossil',
    co2PerKWh: 490,
    lifecycleEmissions: 78,
    conversionEfficiency: 60
  }
];

const CONVERSION_FACTORS = [
  {
    fromUnit: 'kWh',
    toUnit: 'MWh',
    factor: 0.001,
    context: 'energy'
  },
  {
    fromUnit: 'gCO2',
    toUnit: 'kgCO2',
    factor: 0.001,
    context: 'emissions'
  }
];

// Función antigua para obtener fuente de energía
function getEnergySource(name) {
  return ENERGY_SOURCES.find(source => source.name === name);
}

// Función antigua para obtener factor de conversión
function getConversionFactor(from, to) {
  return CONVERSION_FACTORS.find(factor => 
    factor.fromUnit === from && factor.toUnit === to);
}
```

### Después de la Migración (Usando JSON)

1. Primero, asegúrese de que sus datos estén en el formato correcto en `src/data/emissions.json`:

```json
{
  "energySources": [
    {
      "name": "Solar PV",
      "type": "renewable",
      "co2PerKWh": 41,
      "lifecycleEmissions": 6,
      "conversionEfficiency": 20,
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "name": "Wind",
      "type": "renewable",
      "co2PerKWh": 11,
      "lifecycleEmissions": 4,
      "conversionEfficiency": 45,
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "name": "Natural Gas",
      "type": "fossil",
      "co2PerKWh": 490,
      "lifecycleEmissions": 78,
      "conversionEfficiency": 60,
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "conversionFactors": [
    {
      "fromUnit": "kWh",
      "toUnit": "MWh",
      "factor": 0.001,
      "context": "energy",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "fromUnit": "gCO2",
      "toUnit": "kgCO2",
      "factor": 0.001,
      "context": "emissions",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

2. Luego, implemente el cargador de emisiones en `src/utils/emissionsLoader.ts`:

```typescript
import { z } from 'zod';
import { emissionsSchema, EmissionsData, EnergySource, ConversionFactor } from '../schemas/emissionsSchema';
import emissionsData from '../data/emissions.json';

// Carga y valida datos de emisiones desde el archivo JSON
export function loadEmissionsData(): EmissionsData {
  try {
    // Validar los datos contra el esquema
    const validationResult = emissionsSchema.safeParse(emissionsData);
    
    if (!validationResult.success) {
      // Si la validación falla, lanzar un error con los problemas de validación
      const errorMessage = `Emissions data validation failed: ${validationResult.error.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // Devolver los datos validados
    return validationResult.data;
  } catch (error) {
    console.error('Error loading emissions data:', error);
    throw error;
  }
}

// Obtiene una fuente de energía específica por nombre
export function getEnergySourceByName(name: string): EnergySource | undefined {
  const data = loadEmissionsData();
  return data.energySources.find(source => source.name === name);
}

// Obtiene todas las fuentes de energía de un tipo específico
export function getEnergySourcesByType(type: string): EnergySource[] {
  const data = loadEmissionsData();
  return data.energySources.filter(source => source.type === type);
}

// Obtiene un factor de conversión específico
export function getConversionFactor(fromUnit: string, toUnit: string): ConversionFactor | undefined {
  const data = loadEmissionsData();
  return data.conversionFactors.find(
    factor => factor.fromUnit === fromUnit && factor.toUnit === toUnit
  );
}
```

3. Actualice los componentes que utilizan los datos de emisiones:

```typescript
// Antes
import { ENERGY_SOURCES } from '../constants/emissionsData';

function EmissionsCalculator() {
  const [selectedSource, setSelectedSource] = useState(ENERGY_SOURCES[0]);
  // ...
}

// Después
import { loadEmissionsData, getEnergySourceByName } from '../utils/emissionsLoader';

function EmissionsCalculator() {
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    try {
      const data = loadEmissionsData();
      setSources(data.energySources);
      setSelectedSource(data.energySources[0] || null);
    } catch (err) {
      console.error('Failed to load emissions data:', err);
      setError('Error loading emissions data. Please try again later.');
    }
  }, []);
  
  // ...
}
```

## Mejores Prácticas

### Mantenimiento de Datos
- Actualice regularmente los datos de emisiones para reflejar los últimos valores científicos
- Mantenga un historial de cambios en los datos de emisiones
- Documente las fuentes de los datos para referencia futura

### Rendimiento
- Considere implementar caché para los datos de emisiones que no cambian con frecuencia
- Para cálculos intensivos, considere memoizar los resultados
- Monitoree el rendimiento de la carga de datos en diferentes dispositivos

### Extensibilidad
- Diseñe el esquema para permitir la adición de nuevas fuentes de energía en el futuro
- Considere implementar un sistema de versiones para el esquema de datos
- Planifique la internacionalización de unidades y factores de conversión

## Solución de Problemas

### Errores Comunes

#### "Emissions data validation failed"
- **Causa**: Los datos de emisiones en el archivo JSON no cumplen con el esquema definido
- **Solución**: Verifique que todas las fuentes de energía y factores de conversión tengan los campos requeridos y que los tipos de datos sean correctos

#### "Cannot find energy source with name X"
- **Causa**: Se está intentando acceder a una fuente de energía que no existe en los datos
- **Solución**: Verifique el nombre de la fuente de energía y asegúrese de que esté incluida en el archivo JSON

#### "Cannot find conversion factor from X to Y"
- **Causa**: Se está intentando acceder a un factor de conversión que no existe en los datos
- **Solución**: Verifique las unidades de conversión y asegúrese de que el factor esté incluido en el archivo JSON

## Recursos Adicionales

- [Documentación de la API](../api-documentation.md) - Referencia completa de la API
- [Guía de Validación de Esquemas](../validation-best-practices.md) - Mejores prácticas para la validación de datos
- [Guía de Migración de Datos](../data-migration-guide.md) - Guía general para migrar datos codificados directamente a JSON