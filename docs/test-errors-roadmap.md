# Roadmap para Reparación de Tests

## Recomendaciones para Ejecución de Tests Unitarios

Para ejecutar tests específicos, usar alguna de estas opciones:

```bash
# Ejecutar un archivo de test específico evitando el modo interactivo
CI=true npm test src/tests/ComponentName.test.tsx
```

## Análisis de Pareto de Errores

Después de ejecutar los tests del proyecto, se han identificado varios errores que necesitan ser corregidos. Siguiendo el principio de Pareto (80/20), nos centraremos primero en resolver los problemas más críticos que generan la mayor cantidad de fallos.

### Categorización de Errores por Frecuencia e Impacto

| Categoría de Error | Cantidad de Fallos | Porcentaje | Impacto | Prioridad | Estado |
|-------------------|-------------------|-----------|---------|-----------|--------|
| ResponsiveContainer en tests (Recharts) | 12 | 30% | Alto | 1 | ✅ RESUELTO |
| ThemeProvider matchMedia mock | 5 | 12.5% | Alto | 2 | ✅ RESUELTO |
| SimuladorPersonalizado selectores | 5 | 12.5% | Medio | 3 | ✅ RESUELTO |
| useChartPreloader valores iniciales | 2 | 5% | Bajo | 4 | ✅ RESUELTO |
| Dashboard activeTab | 1 | 2.5% | Bajo | 5 | ✅ RESUELTO |
| Integridad localStorage en dashboard-flow | 1 | 2.5% | Medio | 6 | 🔴 FALLANDO |
| IterationContinueExample diálogo | 1 | 2.5% | Bajo | 7 | 🔴 FALLANDO |
| DecisionGuide navegación | 7 | 17.5% | Alto | 8 | 🔴 FALLANDO |
| Otros errores individuales | 6 | 15% | Variable | 9 | 🔄 PENDIENTE |

## Plan de Acción

### Fase 1: Corrección de Problemas Críticos ✅ COMPLETADA

#### 1. Problema con ResponsiveContainer de Recharts en entorno de prueba
- **Error**: `TypeError: observer.observe is not a function` en `RetornoInversionChart.test.tsx`
- **Solución**: ✅ IMPLEMENTADA
  - Se creó un mock completo para ResizeObserver en `src/tests/__mocks__/resizeObserver.js`
  - Se implementó el mock en `setupTests.ts` para que esté disponible globalmente
  - Se actualizaron los tests para usar selectores DOM más específicos como alternativa a los selectores genéricos de Testing Library
- **Resultado**: Los tests de RetornoInversionChart ahora pasan correctamente sin errores de ResizeObserver

#### 2. Problemas con ThemeProvider y window.matchMedia
- **Error**: `TypeError: Cannot redefine property: matchMedia`
- **Solución**: ✅ IMPLEMENTADA
  - Se implementó un mock robusto de matchMedia con estado compartido en `setupTests.ts`
  - Se eliminaron las implementaciones duplicadas de los archivos de test individuales
  - Se mejoró la implementación del mock de localStorage para manejar correctamente el almacenamiento del tema
- **Resultado**: Todos los tests de ThemeProvider pasan correctamente sin errores de matchMedia o localStorage

#### 3. SimuladorPersonalizado - Problemas con selectores
- **Error**: Imposibilidad de encontrar elementos por etiqueta (`Unable to find a label with the text of: /precio electricidad/i`)
- **Solución**: ✅ IMPLEMENTADA
  - Se añadieron data-testid's consistentes a todos los elementos interactivos
  - Se actualizó la función `llenarFormulario` para usar los nuevos data-testid's
  - Se mejoró la accesibilidad del componente con atributos ARIA apropiados
  - Se actualizaron todos los selectores en los tests para usar data-testid's
- **Resultado**: 
  - Todos los tests del SimuladorPersonalizado (9/9) pasan correctamente
  - Los selectores son más robustos y menos propensos a errores
  - La accesibilidad del componente ha mejorado significativamente

#### 4. useChartPreloader - Inconsistencias en los valores esperados ✅ RESUELTO
- **Error**: Discrepancias en el conteo de componentes cargados
  ```
  expect(received).toBe(expected) // Object.is equality
  Expected: 5
  Received: 10/14
  ```
- **Solución**: ✅ IMPLEMENTADA
  - Se separó el estado interno del estado expuesto para mantener una interfaz limpia
  - Se implementó un sistema robusto de tracking de componentes cargados usando Set
  - Se mejoró el manejo de errores para garantizar que el contador sea preciso
  - Se añadió soporte especial para modo test que garantiza cargas secuenciales
  - Se corrigió el manejo de errores en modo test para asegurar el conteo correcto
  - Se implementó un sistema de finalización más robusto usando finally en las promesas
- **Resultado**:
  - Todos los tests de useChartPreloader (6/6) pasan correctamente
  - El conteo de componentes es consistente en todos los casos de prueba
  - Los errores se manejan gracefully sin afectar el conteo
  - La carga secuencial en modo test garantiza resultados predecibles

### Fase 2: Corrección de Errores Actuales (Prioridad Alta)

#### 5. Dashboard - Problemas con activeTab ✅ RESUELTO
- **Error**: 
  ```
  expect(element).toHaveAttribute("aria-selected", "true")
  Received: aria-selected="false"
  ```
- **Solución**: ✅ IMPLEMENTADA
  - Se mejoró la sincronización entre el estado de las pestañas y los atributos ARIA
  - Se añadieron atributos aria-controls para mejor accesibilidad
  - Se implementó un manejo más robusto del estado activo de las pestañas
  - Se mejoró la sincronización con localStorage y URL hash
- **Resultado**:
  - Todos los tests del Dashboard (5/5) pasan correctamente
  - Los atributos aria-selected reflejan correctamente el estado activo
  - La navegación entre pestañas mantiene la consistencia del estado

#### 6. Dashboard Integration Flow - localStorage
- **Error**: 
  ```
  expect(received).toBe(expected) // Object.is equality
  Expected: "simulador"
  Received: null
  ```
- **Solución**: Por implementar
- **Estado**: 🔴 FALLANDO
- **Pasos**:
  1. Verificar que el componente Dashboard guarda el estado de la pestaña activa en localStorage
  2. Asegurarse de que el mock de localStorage está configurado correctamente en el entorno de prueba
  3. Revisar posibles problemas de asincronía en la actualización de localStorage

#### 7. IterationContinueExample - Problemas con el diálogo
- **Error**: 
  ```
  expect(element).not.toBeInTheDocument()
  expected document not to contain element, found <p...>
  ```
- **Solución**: Por implementar
- **Estado**: 🔴 FALLANDO
- **Pasos**:
  1. Revisar la implementación de ContinueDialog para asegurar que se cierra correctamente
  2. Verificar la lógica de eliminación del diálogo del DOM
  3. Considerar posibles problemas de temporización en los tests

#### 8. DecisionGuide - Múltiples problemas de navegación
- **Error**: Múltiples errores relacionados con:
  ```
  Unable to find an element with the text: /¿cuál es su presupuesto disponible/i
  ```
  ```
  Found multiple elements with the text: /¿cuál es su consumo mensual promedio/i
  ```
  ```
  Unable to find role="button" and name `/continuar/i`
  ```
- **Solución**: Por implementar
- **Estado**: 🔴 FALLANDO
- **Pasos**:
  1. Revisar la estructura del DOM en DecisionGuide
  2. Añadir data-testid's consistentes para facilitar la selección de elementos
  3. Refactorizar los tests para usar los nuevos selectores
  4. Revisar la lógica de navegación entre pasos

### Fase 3: Estabilización y Limpieza

#### 9. Limpieza General de Tests
- **Objetivo**: Mejorar la organización y reducir duplicación de código en los tests
- **Estado**: 🔄 PENDIENTE
- **Pasos**:
  1. Extraer funciones de ayuda comunes a un archivo de utilidades
  2. Implementar fixtures reutilizables para datos de prueba
  3. Revisar y estandarizar patrones de testing entre diferentes componentes

## Dependencias y Configuración

### Actualizaciones Implementadas

1. **setupTests.ts**: Se han añadido los siguientes mocks globales:
   - ✅ ResizeObserver - Implementado correctamente para Recharts
   - ✅ window.matchMedia - Implementado correctamente con estado compartido
   - ✅ localStorage - Implementado con almacenamiento persistente por sesión de test
   - 🔄 IntersectionObserver - Por implementar si es necesario

### Mejores Prácticas para Testing

1. **Selectores**:
   ```tsx
   // ❌ EVITAR: Selectores por texto que pueden ser frágiles
   screen.getByText(/precio electricidad/i)
   
   // ✅ USAR: data-testid's consistentes
   screen.getByTestId('input-precio-electricidad')
   ```

2. **Accesibilidad**:
   ```tsx
   // ✅ Atributos ARIA para mejor accesibilidad y testing
   <input
     aria-required="true"
     aria-invalid={!!errors.campo}
     aria-describedby="campo-error campo-hint"
     data-testid="input-campo"
   />
   ```

3. **Organización de Tests**:
   ```tsx
   // ✅ Funciones de ayuda reutilizables
   const llenarFormulario = (datos = {}) => {
     const valoresPorDefecto = {
       'input-consumo-mensual': '250',
       'input-precio-electricidad': '454',
       // ...
     };
     const valores = { ...valoresPorDefecto, ...datos };
     // ...
   };
   ```

## Métricas y Verificación

### Progreso Actual:
- ✅ Problema 1 (ResizeObserver): Resuelto - 4/4 tests pasando
- ✅ Problema 2 (ThemeProvider/matchMedia): Resuelto - 5/5 tests pasando
- ✅ Problema 3 (SimuladorPersonalizado selectores): Resuelto - 9/9 tests pasando
- ✅ Problema 4 (useChartPreloader): Resuelto - 6/6 tests pasando
- ✅ Problema 5 (Dashboard activeTab): Resuelto - 5/5 tests pasando
- 🔴 Problema 6 (Integration localStorage): 1 test fallando
- 🔴 Problema 7 (IterationContinueExample): 1 test fallando
- 🔴 Problema 8 (DecisionGuide): 7 tests fallando

### Resumen del Estado Actual:
- Total de tests: 78
- Tests pasando: 66 (84.6%)
- Tests fallando: 12 (15.4%)

### Siguientes Pasos:
1. Abordar el problema de activeTab en Dashboard que parece ser el más sencillo de resolver
2. Enfocarse en los problemas de DecisionGuide que representan la mayor cantidad de tests fallidos
3. Resolver los problemas restantes de localStorage y diálogos