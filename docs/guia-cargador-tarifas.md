# Guía de Carga de Datos de Tarifas

## Descripción General
Esta guía explica cómo utilizar el mecanismo de carga de datos de tarifas y cómo migrar datos de tarifas codificados directamente al formato JSON.

## Uso del Cargador de Tarifas

### Uso Básico
El cargador de tarifas proporciona varias funciones para acceder a los datos de tarifas desde el archivo JSON:

```typescript
import { loadTariffs, getTariffByName, getTariffsByType } from '../utils/tariffLoader';

// Cargar todas las tarifas
const allTariffs = loadTariffs();

// Obtener una tarifa específica por nombre
const specificTariff = getTariffByName('Tarifa Base');

// Obtener todas las tarifas de un tipo específico
const fixedTariffs = getTariffsByType('fixed');
const variableTariffs = getTariffsByType('variable');
```

### Manejo de Errores
El cargador de tarifas incluye un manejo de errores robusto:

```typescript
try {
  const tariffs = loadTariffs();
  // Procesar tarifas
} catch (error) {
  console.error('Error al cargar datos de tarifas:', error);
  // Implementar mecanismo de respaldo o mostrar error amigable al usuario
}
```

## Migración de Datos Codificados Directamente a JSON

### Antes de la Migración (Codificación Directa)

```typescript
// Enfoque antiguo con tarifas codificadas directamente
const TARIFFS = [
  {
    name: 'Tarifa Base',
    type: 'fixed',
    basePrice: 3.45,
    energyPrice: 0.14,
    powerPrice: 44.44
  },
  {
    name: 'Tarifa Variable',
    type: 'variable',
    basePrice: 3.45,
    energyPrice: 0.12,
    powerPrice: 44.44,
    timeRanges: [
      { startHour: 0, endHour: 7, multiplier: 0.8 },
      { startHour: 8, endHour: 17, multiplier: 1.2 },
      { startHour: 18, endHour: 23, multiplier: 1.5 }
    ]
  }
];

// Función antigua para obtener tarifa
function getTariff(name) {
  return TARIFFS.find(t => t.name === name);
}
```

### Después de la Migración (Usando JSON)

1. Primero, asegúrese de que sus datos estén en el formato correcto en `src/data/tariffs.json`:

```json
{
  "tariffs": [
    {
      "name": "Tarifa Base",
      "type": "fixed",
      "basePrice": 3.45,
      "energyPrice": 0.14,
      "powerPrice": 44.44,
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "name": "Tarifa Variable",
      "type": "variable",
      "basePrice": 3.45,
      "energyPrice": 0.12,
      "powerPrice": 44.44,
      "timeRanges": [
        { "startHour": 0, "endHour": 7, "multiplier": 0.8 },
        { "startHour": 8, "endHour": 17, "multiplier": 1.2 },
        { "startHour": 18, "endHour": 23, "multiplier": 1.5 }
      ],
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

2. Luego, implemente el cargador de tarifas en `src/utils/tariffLoader.ts`:

```typescript
import { z } from 'zod';
import { tariffSchema, TariffData } from '../schemas/tariffSchema';
import tariffData from '../data/tariffs.json';

// Definición de tipo para la estructura del archivo JSON de tarifas
export type TariffsFile = {
  tariffs: TariffData[];
};

// Esquema para validar todo el archivo JSON de tarifas
const tariffsFileSchema = z.object({
  tariffs: z.array(tariffSchema)
});

// Carga y valida datos de tarifas desde el archivo JSON
export function loadTariffs(): TariffData[] {
  try {
    // Validar todo el archivo de tarifas contra el esquema
    const validationResult = tariffsFileSchema.safeParse(tariffData);
    
    if (!validationResult.success) {
      // Si la validación falla, lanzar un error con los problemas de validación
      const errorMessage = `Tariff data validation failed: ${validationResult.error.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // Devolver el array de tarifas validado
    return validationResult.data.tariffs;
  } catch (error) {
    console.error('Error loading tariff data:', error);
    throw error;
  }
}

// Obtiene una tarifa específica por nombre
export function getTariffByName(name: string): TariffData | undefined {
  const tariffs = loadTariffs();
  return tariffs.find(tariff => tariff.name === name);
}

// Obtiene todas las tarifas de un tipo específico
export function getTariffsByType(type: 'fixed' | 'variable'): TariffData[] {
  const tariffs = loadTariffs();
  return tariffs.filter(tariff => tariff.type === type);
}
```

3. Actualice los componentes que utilizan los datos de tarifas:

```typescript
// Antes
import { TARIFFS } from '../constants/tariffData';

function TariffSelector() {
  const [selectedTariff, setSelectedTariff] = useState(TARIFFS[0]);
  // ...
}

// Después
import { loadTariffs, getTariffByName } from '../utils/tariffLoader';

function TariffSelector() {
  const [tariffs, setTariffs] = useState([]);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    try {
      const loadedTariffs = loadTariffs();
      setTariffs(loadedTariffs);
      setSelectedTariff(loadedTariffs[0] || null);
    } catch (err) {
      console.error('Failed to load tariffs:', err);
      setError('Error loading tariff data. Please try again later.');
    }
  }, []);
  
  // ...
}
```

## Mejores Prácticas

### Mantenimiento de Datos
- Actualice regularmente los datos de tarifas para reflejar los precios actuales
- Mantenga un historial de cambios en los datos de tarifas
- Documente la fuente de los datos de tarifas para referencia futura

### Rendimiento
- Considere implementar caché para los datos de tarifas que no cambian con frecuencia
- Para cálculos intensivos, considere memoizar los resultados
- Monitoree el rendimiento de la carga de datos en diferentes dispositivos

### Extensibilidad
- Diseñe el esquema para permitir la adición de nuevos tipos de tarifas en el futuro
- Considere implementar un sistema de versiones para el esquema de datos
- Planifique la internacionalización de nombres y descripciones de tarifas

## Solución de Problemas

### Errores Comunes

#### "Tariff data validation failed"
- **Causa**: Los datos de tarifas en el archivo JSON no cumplen con el esquema definido
- **Solución**: Verifique que todas las tarifas tengan los campos requeridos y que los tipos de datos sean correctos

#### "Cannot find tariff with name X"
- **Causa**: Se está intentando acceder a una tarifa que no existe en los datos
- **Solución**: Verifique el nombre de la tarifa y asegúrese de que esté incluida en el archivo JSON

#### "Invalid tariff type"
- **Causa**: Se está utilizando un tipo de tarifa no válido
- **Solución**: Asegúrese de que el tipo de tarifa sea 'fixed' o 'variable'

## Recursos Adicionales

- [Documentación de la API](../api-documentation.md) - Referencia completa de la API
- [Guía de Validación de Esquemas](../validation-best-practices.md) - Mejores prácticas para la validación de datos
- [Guía de Migración de Datos](../data-migration-guide.md) - Guía general para migrar datos codificados directamente a JSON