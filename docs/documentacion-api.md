# Documentación de API para Cargadores de Datos y Validación de Esquemas

## Descripción General
Este documento proporciona una referencia completa para todas las funciones de carga de datos y utilidades de validación de esquemas utilizadas en la aplicación Energy. Estas APIs son parte de la migración de persistencia de datos desde valores codificados directamente a archivos JSON.

## Cargadores de Datos

### Cargador de Tarifas
Ubicación: `src/utils/tariffLoader.ts`

#### Funciones

##### `loadTariffs(): TariffData[]`
- **Descripción**: Carga y valida todos los datos de tarifas desde el archivo JSON
- **Retorna**: Un array de objetos de datos de tarifas validados
- **Lanza**: Error si los datos no pasan la validación
- **Ejemplo**:
  ```typescript
  import { loadTariffs } from '../utils/tariffLoader';
  
  try {
    const tariffs = loadTariffs();
    console.log(`Cargadas ${tariffs.length} tarifas`);
  } catch (error) {
    console.error('Error al cargar tarifas:', error);
  }
  ```

##### `getTariffByName(name: string): TariffData | undefined`
- **Descripción**: Obtiene una tarifa específica por nombre
- **Parámetros**: 
  - `name`: El nombre de la tarifa a buscar
- **Retorna**: El objeto de tarifa o undefined si no se encuentra
- **Ejemplo**:
  ```typescript
  import { getTariffByName } from '../utils/tariffLoader';
  
  const tariff = getTariffByName('Tarifa Base');
  if (tariff) {
    console.log(`Tarifa encontrada: ${tariff.name}, Precio base: ${tariff.basePrice}`);
  }
  ```

##### `getTariffsByType(type: 'fixed' | 'variable'): TariffData[]`
- **Descripción**: Obtiene todas las tarifas de un tipo específico
- **Parámetros**: 
  - `type`: El tipo de tarifas a buscar ('fixed' o 'variable')
- **Retorna**: Un array de objetos de tarifa que coinciden con el tipo especificado
- **Ejemplo**:
  ```typescript
  import { getTariffsByType } from '../utils/tariffLoader';
  
  const variableTariffs = getTariffsByType('variable');
  console.log(`Encontradas ${variableTariffs.length} tarifas variables`);
  ```

### Cargador de Parámetros de Simulación
Ubicación: `src/utils/simulationParamsLoader.ts`

#### Funciones

##### `loadSimulationParams(): SimulationParams`
- **Descripción**: Carga los parámetros de simulación desde el archivo JSON y los valida contra el esquema
- **Retorna**: Objeto de parámetros de simulación validado
- **Lanza**: Error si la validación falla
- **Ejemplo**:
  ```typescript
  import { loadSimulationParams } from '../utils/simulationParamsLoader';
  
  try {
    const params = loadSimulationParams();
    console.log(`Inversión inicial: ${params.initialInvestment}`);
    console.log(`Vida útil del sistema: ${params.systemLifespan} años`);
  } catch (error) {
    console.error('Error al cargar parámetros de simulación:', error);
  }
  ```

### Cargador de Emisiones
Ubicación: `src/utils/emissionsLoader.ts`

#### Funciones

##### `loadEmissionsData(): EmissionsData`
- **Descripción**: Carga y valida datos de emisiones desde el archivo JSON
- **Retorna**: Objeto de datos de emisiones validado
- **Lanza**: Error si los datos no pasan la validación
- **Ejemplo**:
  ```typescript
  import { loadEmissionsData } from '../utils/emissionsLoader';
  
  try {
    const data = loadEmissionsData();
    console.log(`Cargadas ${data.energySources.length} fuentes de energía`);
    console.log(`Cargados ${data.conversionFactors.length} factores de conversión`);
  } catch (error) {
    console.error('Error al cargar datos de emisiones:', error);
  }
  ```

##### `getEnergySourceByName(name: string): EnergySource | undefined`
- **Descripción**: Obtiene una fuente de energía específica por nombre
- **Parámetros**: 
  - `name`: El nombre de la fuente de energía a buscar
- **Retorna**: El objeto de fuente de energía o undefined si no se encuentra
- **Ejemplo**:
  ```typescript
  import { getEnergySourceByName } from '../utils/emissionsLoader';
  
  const solarPV = getEnergySourceByName('Solar PV');
  if (solarPV) {
    console.log(`Emisiones de CO2 por kWh: ${solarPV.co2PerKWh}`);
    console.log(`Eficiencia de conversión: ${solarPV.conversionEfficiency}%`);
  }
  ```

##### `getEnergySourcesByType(type: string): EnergySource[]`
- **Descripción**: Obtiene todas las fuentes de energía de un tipo específico
- **Parámetros**: 
  - `type`: El tipo de fuentes de energía a buscar (ej. 'renewable', 'fossil')
- **Retorna**: Un array de objetos de fuentes de energía que coinciden con el tipo especificado
- **Ejemplo**:
  ```typescript
  import { getEnergySourcesByType } from '../utils/emissionsLoader';
  
  const renewableSources = getEnergySourcesByType('renewable');
  console.log(`Encontradas ${renewableSources.length} fuentes de energía renovable`);
  ```

##### `getConversionFactor(fromUnit: string, toUnit: string): ConversionFactor | undefined`
- **Descripción**: Obtiene un factor de conversión específico entre dos unidades
- **Parámetros**: 
  - `fromUnit`: La unidad de origen
  - `toUnit`: La unidad de destino
- **Retorna**: El objeto de factor de conversión o undefined si no se encuentra
- **Ejemplo**:
  ```typescript
  import { getConversionFactor } from '../utils/emissionsLoader';
  
  const kwhToMwh = getConversionFactor('kWh', 'MWh');
  if (kwhToMwh) {
    console.log(`Factor de conversión: ${kwhToMwh.factor}`);
    const mwh = 5000 * kwhToMwh.factor; // Convertir 5000 kWh a MWh
    console.log(`5000 kWh = ${mwh} MWh`);
  }
  ```

## Esquemas de Validación

### Esquema de Tarifas
Ubicación: `src/schemas/tariffSchema.ts`

#### Tipos

##### `TariffData`
- **Descripción**: Tipo que define la estructura de datos de una tarifa
- **Propiedades**:
  - `name`: Nombre de la tarifa (string)
  - `type`: Tipo de tarifa ('fixed' o 'variable')
  - `basePrice`: Precio base mensual (number)
  - `energyPrice`: Precio por kWh (number)
  - `powerPrice`: Precio por kW contratado (number, opcional)
  - `timeRanges`: Rangos de tiempo para tarifas variables (array, opcional)
  - `updatedAt`: Fecha de última actualización (string)

#### Funciones

##### `validateTariffData(data: unknown): TariffData[]`
- **Descripción**: Valida datos de tarifas contra el esquema
- **Parámetros**: 
  - `data`: Datos a validar
- **Retorna**: Datos validados si son correctos
- **Lanza**: Error de validación si los datos no cumplen con el esquema

### Esquema de Parámetros de Simulación
Ubicación: `src/schemas/simulationParamsSchema.ts`

#### Tipos

##### `SimulationParams`
- **Descripción**: Tipo que define la estructura de los parámetros de simulación
- **Propiedades**:
  - `initialInvestment`: Inversión inicial (number)
  - `systemLifespan`: Vida útil del sistema en años (number)
  - `maintenanceCost`: Costo anual de mantenimiento (number)
  - `annualDegradation`: Degradación anual del rendimiento (number)
  - `energyPriceInflation`: Inflación anual del precio de la energía (number)
  - `financingRate`: Tasa de financiación (number, opcional)
  - `taxRate`: Tasa impositiva (number, opcional)
  - `incentives`: Incentivos disponibles (array, opcional)
  - `updatedAt`: Fecha de última actualización (string)

#### Funciones

##### `validateSimulationParams(data: unknown): SimulationParams`
- **Descripción**: Valida parámetros de simulación contra el esquema
- **Parámetros**: 
  - `data`: Datos a validar
- **Retorna**: Datos validados si son correctos
- **Lanza**: Error de validación si los datos no cumplen con el esquema

### Esquema de Emisiones
Ubicación: `src/schemas/emissionsSchema.ts`

#### Tipos

##### `EmissionsData`
- **Descripción**: Tipo que define la estructura de los datos de emisiones
- **Propiedades**:
  - `energySources`: Array de fuentes de energía
  - `conversionFactors`: Array de factores de conversión
  - `updatedAt`: Fecha de última actualización (string)

##### `EnergySource`
- **Descripción**: Tipo que define la estructura de una fuente de energía
- **Propiedades**:
  - `name`: Nombre de la fuente de energía (string)
  - `type`: Tipo de fuente ('renewable', 'fossil', 'nuclear', 'hybrid')
  - `co2PerKWh`: Emisiones de CO2 por kWh (number)
  - `lifecycleEmissions`: Emisiones durante el ciclo de vida (number)
  - `conversionEfficiency`: Eficiencia de conversión en porcentaje (number)
  - `updatedAt`: Fecha de última actualización (string)

##### `ConversionFactor`
- **Descripción**: Tipo que define la estructura de un factor de conversión
- **Propiedades**:
  - `fromUnit`: Unidad de origen (string)
  - `toUnit`: Unidad de destino (string)
  - `factor`: Factor de conversión (number)
  - `context`: Contexto de la conversión (string, opcional)
  - `notes`: Notas adicionales (string, opcional)

#### Funciones

##### `validateEmissionsData(data: unknown): EmissionsData`
- **Descripción**: Valida datos de emisiones contra el esquema
- **Parámetros**: 
  - `data`: Datos a validar
- **Retorna**: Datos validados si son correctos
- **Lanza**: Error de validación si los datos no cumplen con el esquema

## Mejores Prácticas

### Manejo de Errores
Siempre envuelva las llamadas a los cargadores de datos en bloques try-catch para manejar posibles errores de validación:

```typescript
try {
  const data = loadEmissionsData();
  // Procesar datos
} catch (error) {
  console.error('Error al cargar datos:', error);
  // Mostrar mensaje de error al usuario o implementar mecanismo de respaldo
}
```

### Actualización de Datos
Cuando actualice los archivos JSON, asegúrese de:

1. Seguir el esquema definido para cada tipo de datos
2. Actualizar el campo `updatedAt` con la fecha y hora actual
3. Validar el archivo JSON antes de implementarlo

### Rendimiento
Los cargadores de datos están optimizados para el rendimiento, pero tenga en cuenta:

1. Los datos se cargan y validan cada vez que se llama a la función del cargador
2. Para datos que no cambian durante la sesión del usuario, considere almacenar en caché los resultados
3. Para conjuntos de datos grandes, considere implementar carga perezosa o paginación

## Solución de Problemas

### Errores Comunes

#### "Tariff data validation failed"
- **Causa**: Los datos de tarifas en el archivo JSON no cumplen con el esquema definido
- **Solución**: Verifique que todas las tarifas tengan los campos requeridos y que los tipos de datos sean correctos

#### "Simulation parameters validation failed"
- **Causa**: Los parámetros de simulación en el archivo JSON no cumplen con el esquema definido
- **Solución**: Verifique que todos los parámetros requeridos estén presentes y que los tipos de datos sean correctos

#### "Emissions data validation failed"
- **Causa**: Los datos de emisiones en el archivo JSON no cumplen con el esquema definido
- **Solución**: Verifique que todas las fuentes de energía y factores de conversión tengan los campos requeridos y que los tipos de datos sean correctos