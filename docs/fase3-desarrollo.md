# Guía de Desarrollo - Fase 3: Pruebas y Optimización

Este documento describe las tareas pendientes y completadas en la Fase 3 del proyecto Dashboard Comparativo de Energía, junto con instrucciones para implementarlas correctamente.

## Estado Actual

- ✅ Implementación del modo oscuro con ThemeProvider
- ✅ Mejoras en las pruebas de componentes principales
- 🔄 Corrección de problemas en pruebas unitarias
- 🔄 Optimización de rendimiento
- 🔄 Mejoras de accesibilidad

## Tareas Pendientes

### 1. Corrección de Problemas en Pruebas Unitarias

#### Descripción
Se han corregido algunas pruebas para los componentes Dashboard y SimuladorPersonalizado usando selectores más específicos. Sin embargo, aún hay pruebas adicionales que necesitan ser revisadas y actualizadas para utilizar buenas prácticas de testing.

#### Acciones
- [ ] Revisar y actualizar las pruebas para el componente DecisionGuide.test.tsx
- [ ] Añadir pruebas para el ThemeProvider.tsx
- [ ] Asegurar que todas las pruebas usen selectores accesibles (rol, aria-label, data-testid)
- [ ] Añadir pruebas para validar el comportamiento de los formularios

#### Ejemplo de Implementación
```tsx
// ThemeProvider.test.tsx
describe('ThemeProvider', () => {
  test('debe aplicar el tema claro por defecto', () => {
    render(
      <ThemeProvider>
        <div data-testid="themed-element">Test</div>
      </ThemeProvider>
    );
    
    const html = document.documentElement;
    expect(html).toHaveClass('light');
  });

  test('debe cambiar entre los temas cuando se llama a toggleTheme', () => {
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme();
      return (
        <button onClick={toggleTheme} data-testid="theme-toggle">
          {theme}
        </button>
      );
    };
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const toggleButton = screen.getByTestId('theme-toggle');
    expect(toggleButton).toHaveTextContent('light');
    
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('dark');
    const html = document.documentElement;
    expect(html).toHaveClass('dark');
  });
});
```

### 2. Pruebas de Integración

#### Descripción
Necesitamos pruebas de integración que verifiquen que los componentes funcionan correctamente en conjunto.

#### Acciones
- [ ] Crear pruebas que verifiquen la navegación entre pestañas
- [ ] Crear pruebas para el flujo completo del Asistente de Decisión
- [ ] Verificar que cambiar parámetros en el Simulador actualiza correctamente los resultados
- [ ] Probar la persistencia del tema elegido

#### Ejemplo de Implementación
```tsx
// integration/dashboard-flow.test.tsx
test('flujo completo de navegación de pestañas y simulación', async () => {
  render(<App />);
  
  // Inicialmente debería mostrar la pestaña de gráficos
  expect(screen.getByText('Análisis Comparativo')).toBeInTheDocument();
  
  // Cambiar a simulador
  fireEvent.click(screen.getByRole('button', { name: 'Simulador Personalizado' }));
  expect(screen.getByText('Simulador de Escenarios Personalizados')).toBeInTheDocument();
  
  // Modificar parámetros
  const consumoInput = screen.getByDisplayValue('231');
  fireEvent.change(consumoInput, { target: { value: '400' } });
  
  // Verificar que se actualizan los resultados
  await waitFor(() => {
    // Verificar algún cambio esperado en los resultados
    expect(screen.getByText(/Con los parámetros seleccionados/)).toBeInTheDocument();
  });
  
  // Cambiar a asistente de decisión
  fireEvent.click(screen.getByRole('button', { name: 'Asistente de Decisión' }));
  expect(screen.getByText('Asistente de Toma de Decisiones')).toBeInTheDocument();
});
```

### 3. Optimización de Rendimiento

#### Descripción
Se deben implementar optimizaciones de rendimiento para mejorar la experiencia del usuario, especialmente en dispositivos móviles o con conexiones lentas.

#### Acciones
- [ ] Implementar memorización de componentes con React.memo() para los componentes que no cambian frecuentemente
- [ ] Utilizar useMemo() y useCallback() para cálculos costosos y funciones
- [ ] Implementar lazy loading para componentes pesados
- [ ] Optimizar renderizado de gráficos grandes reduciendo puntos de datos cuando sea posible
- [ ] Añadir estados de carga para operaciones que puedan tardar

#### Ejemplo de Implementación
```tsx
// Para implementar lazy loading
import React, { lazy, Suspense } from 'react';

// Lazy load de componentes pesados
const SimuladorPersonalizado = lazy(() => import('./components/SimuladorPersonalizado'));
const DecisionGuide = lazy(() => import('./components/DecisionGuide'));
const GraficosComparativos = lazy(() => import('./graficos-comparativos'));

function Dashboard() {
  // ...código existente...
  
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-800 min-h-screen">
      {/* ...código existente... */}
      
      <div className="pb-12">
        <Suspense fallback={<div className="text-center p-10">Cargando...</div>}>
          {activeTab === 'graficos' && <GraficosComparativos />}
          {activeTab === 'simulador' && <SimuladorPersonalizado />}
          {activeTab === 'decision' && <DecisionGuide />}
        </Suspense>
      </div>
    </div>
  );
}
```

### 4. Mejoras de Accesibilidad

#### Descripción
Se deben implementar mejoras adicionales de accesibilidad para cumplir con las normas WCAG 2.1 nivel AA.

#### Acciones
- [ ] Asegurar que todos los elementos interactivos sean accesibles mediante teclado
- [ ] Verificar el contraste de color en ambos modos (claro y oscuro)
- [ ] Añadir etiquetas ARIA cuando sean necesarias
- [ ] Implementar manejo adecuado de focus para experiencia de teclado
- [ ] Asegurar que todos los campos de formulario tienen etiquetas asociadas
- [ ] Implementar skip links para navegación por teclado

#### Ejemplo de Implementación
```tsx
// Mejoras de accesibilidad en formularios
<div className="form-group">
  <label htmlFor="consumo-mensual" id="consumo-mensual-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Consumo mensual promedio (kWh)
  </label>
  <div className="flex items-center">
    <input
      id="consumo-mensual"
      type="number"
      aria-labelledby="consumo-mensual-label"
      aria-describedby="consumo-mensual-descripcion"
      className="border rounded-md py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={consumoMensual}
      onChange={(e) => setConsumoMensual(Number(e.target.value))}
      min="0"
    />
  </div>
  <p id="consumo-mensual-descripcion" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
    El consumo mensual típico de un hogar en Colombia está entre 150-300 kWh
  </p>
</div>
```

## Siguientes Pasos

1. Priorizar la corrección de las pruebas unitarias existentes
2. Implementar pruebas para el ThemeProvider
3. Aplicar optimizaciones de rendimiento comenzando por los componentes más pesados
4. Realizar un audit de accesibilidad con herramientas como Lighthouse o axe
5. Corregir todos los problemas de accesibilidad identificados

Una vez completadas estas tareas, estaremos listos para avanzar a la Fase 4 del desarrollo.

---

## Referencias

- [Documentación de React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Guía de optimización de rendimiento en React](https://reactjs.org/docs/optimizing-performance.html)
- [WCAG 2.1 Especificaciones](https://www.w3.org/TR/WCAG21/)