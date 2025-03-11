# Guía de Migración de Datos: De Codificación Directa a JSON

## Descripción General
Esta guía proporciona instrucciones paso a paso para migrar datos codificados directamente a archivos JSON en la aplicación Energy. Esta migración es parte de nuestro esfuerzo para mejorar la mantenibilidad, escalabilidad y capacidad de prueba de la aplicación.

## Proceso de Migración

### Paso 1: Identificar Datos Codificados Directamente
Antes de comenzar la migración, identifique todos los datos codificados directamente en sus componentes:

1. Busque arrays o objetos constantes definidos en la parte superior de los archivos de componentes
2. Identifique valores de configuración incrustados dentro de la lógica del componente
3. Encuentre cualquier estructura de datos estática utilizada para cálculos o visualización

### Paso 2: Diseñar la Estructura JSON
Diseñe una estructura JSON clara y consistente basada en los requisitos del esquema:

1. Revise el archivo de esquema apropiado (tariffSchema.ts, simulationParamsSchema.ts o emissionsSchema.ts)
2. Asegúrese de que se incluyan todos los campos requeridos
3. Siga las reglas de validación definidas en el esquema
4. Agregue una marca de tiempo `updatedAt` para realizar un seguimiento de la actualidad de los datos

### Paso 3: Crear Archivo JSON
Cree un nuevo archivo JSON en el directorio `src/data/`:

```json
// Ejemplo para tariffs.json
{
  "tariffs": [
    {
      "name": "Tarifa Base",
      "type": "fixed",
      "basePrice": 3.45,
      "energyPrice": 0.14,
      "powerPrice": 44.44,
      "updatedAt": "2023-06-15T10:00:00Z"
    },
    {
      "name": "Tarifa Variable",
      "type": "variable",
      "basePrice": 2.80,
      "energyPrice": 0.12,
      "timeRanges": [
        {
          "startHour": 0,
          "endHour": 7,
          "multiplier": 0.8
        },
        {
          "startHour": 8,
          "endHour": 17,
          "multiplier": 1.2
        },
        {
          "startHour": 18,
          "endHour": 23,
          "multiplier": 1.5
        }
      ],
      "updatedAt": "2023-06-15T10:00:00Z"
    }
  ]
}
```

### Paso 4: Implementar Función de Carga
Implemente o actualice la función de carga apropiada en el directorio utils:

```typescript
// Ejemplo para tariffLoader.ts
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
```

### Paso 5: Actualizar Referencias en Componentes
Actualice todos los componentes que utilizaban datos codificados directamente para usar la nueva función de carga:

```typescript
// Antes
import { TARIFFS } from '../constants/tariffData';

function TariffSelector() {
  const [selectedTariff, setSelectedTariff] = useState(TARIFFS[0]);
  // ...
}

// Después
import { loadTariffs } from '../utils/tariffLoader';

function TariffSelector() {
  const [tariffs, setTariffs] = useState<TariffData[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<TariffData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
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

### Paso 6: Implementar Manejo de Errores
Asegúrese de que su aplicación maneje correctamente los errores de carga de datos:

```typescript
function DataDependentComponent() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const loadedData = loadTariffs(); // o cualquier otra función de carga
        setData(loadedData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load necessary data. Please refresh the page or try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return <EmptyState message="No data available" />;
  
  return (
    // Renderizar componente con datos
  );
}
```

### Paso 7: Pruebas
Actualice o cree pruebas para verificar que la migración funcione correctamente:

```typescript
import { loadTariffs } from '../utils/tariffLoader';

describe('Tariff Loader', () => {
  test('should load tariffs correctly', () => {
    const tariffs = loadTariffs();
    
    // Verificar que se cargaron los datos
    expect(tariffs).toBeDefined();
    expect(Array.isArray(tariffs)).toBe(true);
    expect(tariffs.length).toBeGreaterThan(0);
    
    // Verificar la estructura de los datos
    const firstTariff = tariffs[0];
    expect(firstTariff).toHaveProperty('name');
    expect(firstTariff).toHaveProperty('type');
    expect(firstTariff).toHaveProperty('basePrice');
    expect(firstTariff).toHaveProperty('energyPrice');
  });
  
  test('should handle invalid data gracefully', () => {
    // Mockear el módulo de datos para simular datos inválidos
    jest.mock('../data/tariffs.json', () => ({
      tariffs: [{ invalid: 'data' }]
    }));
    
    // La función debería lanzar un error
    expect(() => loadTariffs()).toThrow();
  });
});
```

## Mejores Prácticas

### Mantenimiento de Datos
- Mantenga un historial de cambios en los archivos JSON
- Actualice siempre el campo `updatedAt` cuando modifique los datos
- Considere implementar un sistema de versionado para los archivos de datos

### Rendimiento
- Para conjuntos de datos grandes, considere implementar mecanismos de caché
- Utilice técnicas de carga perezosa para datos que no se necesitan inmediatamente
- Monitoree el rendimiento de la carga de datos en diferentes dispositivos y conexiones

### Seguridad
- No almacene información sensible en archivos JSON del lado del cliente
- Considere ofuscar o encriptar datos críticos si es necesario
- Implemente validación tanto en el cliente como en el servidor para datos que provienen de API

## Solución de Problemas

### Errores Comunes

#### "Cannot find module '../data/file.json'"
- **Causa**: El archivo JSON no existe en la ubicación especificada
- **Solución**: Verifique la ruta del archivo y asegúrese de que se haya creado correctamente

#### "Unexpected token in JSON at position X"
- **Causa**: El archivo JSON contiene errores de sintaxis
- **Solución**: Valide el archivo JSON utilizando una herramienta como JSONLint

#### "Validation failed: X is required"
- **Causa**: Falta un campo requerido en los datos JSON
- **Solución**: Asegúrese de que todos los campos requeridos estén presentes en el archivo JSON

## Recursos Adicionales

- [Documentación de Zod](https://github.com/colinhacks/zod) - La biblioteca de validación utilizada en este proyecto
- [Mejores prácticas de JSON](https://www.w3schools.com/js/js_json_syntax.asp) - Guía de sintaxis y mejores prácticas de JSON
- [Herramientas de validación JSON](https://jsonlint.com/) - Herramientas en línea para validar archivos JSON