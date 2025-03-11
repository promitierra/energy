# Estrategia de Pruebas para Persistencia de Datos

## Descripción General
Este documento describe la estrategia de pruebas para el proyecto de migración de persistencia de datos. Cubre pruebas unitarias, pruebas de integración y pruebas de extremo a extremo para validación de datos, carga y manejo de errores.

## Objetivos de las Pruebas

1. Asegurar que la validación de datos funcione correctamente para todos los tipos de esquemas
2. Verificar que las funciones de carga de datos manejen adecuadamente tanto datos válidos como inválidos
3. Confirmar que los mecanismos de manejo de errores proporcionen retroalimentación útil
4. Medir y optimizar el rendimiento de las operaciones de carga de datos
5. Validar la renderización de componentes con datos cargados

## Requisitos de Cobertura de Pruebas

El proyecto tiene como objetivo lograr una cobertura de pruebas >90% para el código de validación de datos. Esto incluye:

- Todos los validadores de esquemas (tariffSchema, simulationParamsSchema, emissionsSchema)
- Todas las funciones de carga de datos (loadTariffs, loadSimulationParams, loadEmissionsData)
- Mecanismos de manejo de errores
- Integración de componentes con datos cargados

## Tipos de Pruebas

### Pruebas Unitarias

#### Pruebas de Validación de Esquemas

```typescript
// Ejemplo: Prueba de validación de esquema de tarifas
import { tariffSchema } from '../schemas/tariffSchema';

describe('Validación de Esquema de Tarifas', () => {
  test('debería validar datos de tarifa correctos', () => {
    const validTariff = {
      name: 'Tarifa de Prueba',
      type: 'fixed',
      basePrice: 10.5,
      energyPrice: 0.15,
      powerPrice: 45.0,
      updatedAt: new Date().toISOString()
    };
    
    const result = tariffSchema.safeParse(validTariff);
    expect(result.success).toBe(true);
  });
  
  test('debería rechazar datos de tarifa inválidos', () => {
    const invalidTariff = {
      name: 'Tarifa de Prueba',
      type: 'invalid-type', // Valor de enumeración inválido
      basePrice: -10, // Valor negativo no permitido
      energyPrice: 0.15,
      updatedAt: 'not-a-date' // Formato de fecha inválido
    };
    
    const result = tariffSchema.safeParse(invalidTariff);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      // Verificar errores de validación específicos
      const formattedError = result.error.format();
      expect(formattedError.type?._errors).toBeDefined();
      expect(formattedError.basePrice?._errors).toBeDefined();
      expect(formattedError.updatedAt?._errors).toBeDefined();
    }
  });
});
```

#### Pruebas de Cargador de Datos

```typescript
// Ejemplo: Prueba de cargador de tarifas
import { loadTariffs } from '../utils/tariffLoader';
import tariffData from '../data/tariffs.json';

// Simular la importación JSON
jest.mock('../data/tariffs.json', () => ({
  tariffs: [
    {
      name: 'Tarifa de Prueba',
      type: 'fixed',
      basePrice: 10.5,
      energyPrice: 0.15,
      powerPrice: 45.0,
      updatedAt: '2023-06-15T10:00:00Z'
    }
  ]
}));

describe('Cargador de Tarifas', () => {
  test('debería cargar y validar tarifas exitosamente', () => {
    const tariffs = loadTariffs();
    
    expect(tariffs).toBeDefined();
    expect(Array.isArray(tariffs)).toBe(true);
    expect(tariffs.length).toBe(1);
    expect(tariffs[0].name).toBe('Tarifa de Prueba');
  });
});
```

#### Pruebas de Manejo de Errores

```typescript
// Ejemplo: Prueba de manejo de errores en el cargador de tarifas
import { loadTariffs } from '../utils/tariffLoader';

// Simular la importación JSON con datos inválidos
jest.mock('../data/tariffs.json', () => ({
  tariffs: [
    {
      name: 'Tarifa Inválida',
      type: 'unknown', // Tipo inválido
      basePrice: -5, // Valor negativo inválido
      energyPrice: 0.15,
      updatedAt: 'not-a-date' // Fecha inválida
    }
  ]
}));

describe('Manejo de Errores del Cargador de Tarifas', () => {
  test('debería lanzar error para datos de tarifa inválidos', () => {
    expect(() => loadTariffs()).toThrow();
    
    try {
      loadTariffs();
    } catch (error) {
      expect(error.message).toContain('Tariff data validation failed');
    }
  });
});
```

### Pruebas de Integración

#### Componente con Carga de Datos

```typescript
// Ejemplo: Prueba de componente con carga de datos
import { render, screen, waitFor } from '@testing-library/react';
import TariffSelector from '../components/TariffSelector';
import { loadTariffs } from '../utils/tariffLoader';

// Simular la función de carga
jest.mock('../utils/tariffLoader', () => ({
  loadTariffs: jest.fn()
}));

describe('Componente TariffSelector', () => {
  test('debería renderizar tarifas cuando se cargan exitosamente', async () => {
    // Simular carga de datos exitosa
    (loadTariffs as jest.Mock).mockReturnValue([
      {
        name: 'Tarifa de Prueba 1',
        type: 'fixed',
        basePrice: 10.5,
        energyPrice: 0.15,
        updatedAt: '2023-06-15T10:00:00Z'
      },
      {
        name: 'Tarifa de Prueba 2',
        type: 'variable',
        basePrice: 8.5,
        energyPrice: 0.12,
        timeRanges: [
          { startHour: 0, endHour: 8, multiplier: 0.8 },
          { startHour: 9, endHour: 23, multiplier: 1.2 }
        ],
        updatedAt: '2023-06-15T10:00:00Z'
      }
    ]);
    
    render(<TariffSelector />);
    
    // Esperar a que el componente cargue los datos
    await waitFor(() => {
      expect(screen.getByText('Tarifa de Prueba 1')).toBeInTheDocument();
      expect(screen.getByText('Tarifa de Prueba 2')).toBeInTheDocument();
    });
  });
  
  test('debería mostrar mensaje de error cuando falla la carga de datos', async () => {
    // Simular fallo en la carga de datos
    (loadTariffs as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to load tariff data');
    });
    
    render(<TariffSelector />);
    
    // Esperar mensaje de error
    await waitFor(() => {
      expect(screen.getByText('Failed to load tariff data')).toBeInTheDocument();
    });
  });
});
```

### Pruebas de Extremo a Extremo

```typescript
// Ejemplo: Prueba E2E para carga de datos en el flujo de la aplicación
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('Flujo E2E de la Aplicación', () => {
  test('debería cargar y mostrar datos a lo largo de la aplicación', async () => {
    render(<App />);
    
    // Esperar la carga inicial de datos
    await waitFor(() => {
      expect(screen.getByText('Energy Dashboard')).toBeInTheDocument();
    });
    
    // Navegar a la selección de tarifas
    userEvent.click(screen.getByText('Tariff Selection'));
    
    // Verificar que los datos de tarifas se cargan y muestran
    await waitFor(() => {
      expect(screen.getByText('Tarifa Base')).toBeInTheDocument();
    });
    
    // Seleccionar una tarifa diferente
    userEvent.selectOptions(screen.getByRole('combobox'), 'Tarifa Variable');
    
    // Verificar que los detalles de la tarifa se actualizan
    await waitFor(() => {
      expect(screen.getByText('Time-based pricing')).toBeInTheDocument();
    });
  });
});
```

## Pruebas de Rendimiento

### Rendimiento de Carga de Datos

```typescript
// Ejemplo: Prueba de rendimiento de carga de datos
import { loadTariffs } from '../utils/tariffLoader';
import { loadSimulationParams } from '../utils/simulationParamsLoader';
import { loadEmissionsData } from '../utils/emissionsLoader';

describe('Rendimiento de Carga de Datos', () => {
  test('debería cargar datos de tarifas en un tiempo aceptable', () => {
    const startTime = performance.now();
    loadTariffs();
    const endTime = performance.now();
    
    const loadTime = endTime - startTime;
    console.log(`Tiempo de carga de datos de tarifas: ${loadTime}ms`);
    
    // Asegurar que el tiempo de carga esté por debajo del umbral (ej., 50ms)
    expect(loadTime).toBeLessThan(50);
  });
  
  test('debería cargar parámetros de simulación en un tiempo aceptable', () => {
    const startTime = performance.now();
    loadSimulationParams();
    const endTime = performance.now();
    
    const loadTime = endTime - startTime;
    console.log(`Tiempo de carga de parámetros de simulación: ${loadTime}ms`);
    
    expect(loadTime).toBeLessThan(50);
  });
  
  test('debería cargar datos de emisiones en un tiempo aceptable', () => {
    const startTime = performance.now();
    loadEmissionsData();
    const endTime = performance.now();
    
    const loadTime = endTime - startTime;
    console.log(`Tiempo de carga de datos de emisiones: ${loadTime}ms`);
    
    expect(loadTime).toBeLessThan(50);
  });
});
```

## Pruebas de Instantánea (Snapshot)

```typescript
// Ejemplo: Pruebas de instantánea para estructuras de datos
import { loadTariffs } from '../utils/tariffLoader';

describe('Instantáneas de Estructura de Datos', () => {
  test('debería mantener una estructura de datos de tarifas consistente', () => {
    const tariffs = loadTariffs();
    expect(tariffs).toMatchSnapshot();
  });
});
```

## Pruebas de Casos Límite

```typescript
// Ejemplo: Prueba de casos límite para validación de datos
import { tariffSchema } from '../schemas/tariffSchema';

describe('Casos Límite de Validación de Datos', () => {
  test('debería manejar valores extremos correctamente', () => {
    // Valores extremos pero válidos
    const extremeTariff = {
      name: 'X'.repeat(100), // Nombre muy largo
      type: 'fixed',
      basePrice: Number.MAX_SAFE_INTEGER, // Valor muy grande
      energyPrice: Number.MIN_VALUE, // Valor muy pequeño
      updatedAt: new Date().toISOString()
    };
    
    const result = tariffSchema.safeParse(extremeTariff);
    expect(result.success).toBe(true);
  });
  
  test('debería rechazar valores fuera de rango', () => {
    // Valores fuera de rango
    const outOfRangeTariff = {
      name: '', // Nombre vacío
      type: 'fixed',
      basePrice: -1, // Valor negativo
      energyPrice: 0,
      updatedAt: new Date().toISOString()
    };
    
    const result = tariffSchema.safeParse(outOfRangeTariff);
    expect(result.success).toBe(false);
  });
});
```

## Pruebas de Integración Cruzada

```typescript
// Ejemplo: Prueba de integración entre diferentes cargadores de datos
import { loadTariffs } from '../utils/tariffLoader';
import { loadEmissionsData } from '../utils/emissionsLoader';
import { loadSimulationParams } from '../utils/simulationParamsLoader';

describe('Integración Cruzada de Cargadores de Datos', () => {
  test('debería permitir cálculos que utilizan múltiples fuentes de datos', () => {
    // Cargar datos de diferentes fuentes
    const tariffs = loadTariffs();
    const emissionsData = loadEmissionsData();
    const simulationParams = loadSimulationParams();
    
    // Verificar que todos los datos se cargaron correctamente
    expect(tariffs).toBeDefined();
    expect(emissionsData).toBeDefined();
    expect(simulationParams).toBeDefined();
    
    // Realizar un cálculo que utiliza datos de múltiples fuentes
    const solarSource = emissionsData.energySources.find(s => s.name === 'Solar PV');
    const fixedTariff = tariffs.find(t => t.type === 'fixed');
    
    if (solarSource && fixedTariff) {
      // Calcular costo de emisiones durante la vida útil
      const lifetimeEmissionsCost = solarSource.lifecycleEmissions * simulationParams.systemLifespan;
      
      // Calcular costo energético durante la vida útil
      const lifetimeEnergyCost = fixedTariff.energyPrice * simulationParams.systemLifespan * 365 * 24;
      
      // Verificar que los cálculos son posibles y producen resultados válidos
      expect(lifetimeEmissionsCost).toBeGreaterThan(0);
      expect(lifetimeEnergyCost).toBeGreaterThan(0);
    }
  });
});
```

## Mejores Prácticas

### Organización de Pruebas
- Organice las pruebas en carpetas que reflejen la estructura del código fuente
- Utilice nombres descriptivos para los archivos de prueba y casos de prueba
- Agrupe las pruebas relacionadas en bloques `describe`

### Manejo de Datos de Prueba
- Utilice datos de prueba consistentes y realistas
- Evite dependencias entre pruebas
- Limpie los datos después de cada prueba cuando sea necesario

### Manejo de Errores
- Pruebe tanto los casos de éxito como los de error
- Verifique mensajes de error específicos
- Asegúrese de que los errores se propaguen correctamente

## Herramientas y Configuración

### Jest
Utilizamos Jest como nuestro framework principal de pruebas:

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    }
  }
};
```

### Testing Library
Utilizamos React Testing Library para pruebas de componentes:

```typescript
// setupTests.ts
import '@testing-library/jest-dom';
```

## Ejecución de Pruebas

### Comandos

- `npm test`: Ejecuta todas las pruebas
- `npm test -- --watch`: Ejecuta pruebas en modo observador
- `npm test -- --coverage`: Ejecuta pruebas con informe de cobertura
- `npm test -- -t "nombre de prueba"`: Ejecuta pruebas específicas por nombre

### Integración Continua

Las pruebas se ejecutan automáticamente en cada pull request y push a la rama principal:

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16.x'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Solución de Problemas Comunes

### Pruebas Lentas
- Utilice mocks para servicios externos y operaciones costosas
- Minimice el uso de `beforeEach` y `afterEach` cuando sea posible
- Considere ejecutar pruebas en paralelo

### Pruebas Frágiles
- Evite acoplar pruebas a la implementación
- Utilice selectores estables (como roles y texto) en lugar de clases o IDs
- Evite dependencias entre pruebas

### Cobertura Insuficiente
- Identifique áreas con baja cobertura utilizando informes de cobertura
- Priorice la cobertura de código crítico para el negocio
- Implemente pruebas para casos límite y manejo de errores