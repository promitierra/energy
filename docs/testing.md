# Guía de Testing

## Introducción
Este proyecto incluye tests para diferentes tipos de componentes: gráficos con Recharts, componentes que dependen del tema, y formularios interactivos. Esta guía explica las implementaciones y patrones utilizados para asegurar un testing efectivo.

## Configuraciones Especiales

### 1. Mock de ResizeObserver
Los componentes de Recharts dependen del ResizeObserver API. Se creó un mock personalizado en `src/tests/__mocks__/resizeObserver.js` que simula su comportamiento.

### 2. Mock de window.matchMedia
Los componentes que manejan el tema dependen de window.matchMedia. Se implementó un mock robusto que:
- Mantiene un estado compartido entre tests
- Permite cambiar dinámicamente las preferencias del sistema
- Es accesible globalmente a través de `window.__setPrefersDarkMode`

### 3. Mock de localStorage
Se implementó un mock de localStorage que:
- Mantiene un almacenamiento persistente durante la sesión de test
- Se limpia automáticamente entre tests
- Simula correctamente todos los métodos del API de localStorage

## Patrones de Testing Establecidos

### A. Selectores en Tests
Para asegurar tests robustos y mantenibles:
```tsx
// ❌ NO RECOMENDADO: Selectores frágiles por texto
const input = screen.getByLabelText(/precio electricidad/i);

// ✅ RECOMENDADO: Uso de data-testid
const input = screen.getByTestId('input-precio-electricidad');
```

### B. Accesibilidad y Testing
Los componentes implementan atributos ARIA que mejoran tanto la accesibilidad como la testeabilidad:
```tsx
// En el componente
<input
  data-testid="input-consumo-mensual"
  aria-required="true"
  aria-invalid={!!errors.consumoMensual}
  aria-describedby="consumoMensual-error consumoMensual-hint"
/>

// En el test
expect(input).toHaveAttribute('aria-required', 'true');
expect(input).toHaveAttribute('aria-invalid', 'true');
```

### C. Funciones de Ayuda Reutilizables
Para reducir la duplicación de código y mejorar la mantenibilidad:
```tsx
const llenarFormulario = (datos = {}) => {
  const valoresPorDefecto = {
    'input-consumo-mensual': '250',
    'input-precio-electricidad': '454',
    'input-horas-sol': '5',
    'input-inversion-inicial': '9500000'
  };
  const valores = { ...valoresPorDefecto, ...datos };
  
  Object.entries(valores).forEach(([testId, valor]) => {
    const input = screen.getByTestId(testId);
    fireEvent.change(input, { target: { value: valor } });
  });
};

// Uso en tests
test('calcula correctamente con datos válidos', async () => {
  renderComponent();
  llenarFormulario();
  
  const btnCalcular = screen.getByTestId('btn-calcular');
  fireEvent.click(btnCalcular);

  await waitFor(() => {
    expect(screen.getByTestId('resultado-calculo')).toBeInTheDocument();
  });
});
```

## Testing de Componentes Específicos

### A. Componentes con Recharts
```tsx
test('renderiza el gráfico con datos válidos', async () => {
  render(
    <ThemeProvider>
      <RetornoInversionChart data={mockData} initialInvestment={2000000} />
    </ThemeProvider>
  );

  await waitFor(() => {
    const chartContainer = document.querySelector('.recharts-responsive-container');
    expect(chartContainer).toBeInTheDocument();
    
    const notification = document.querySelector('[aria-live="polite"]');
    expect(notification).toBeInTheDocument();
    expect(notification.textContent).toMatch(/inversión inicial/i);
  });
});
```

### B. Componentes con Tema
```tsx
test('debe usar el tema del sistema si está disponible', () => {
  window.__setPrefersDarkMode(true);
  
  render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );
  
  expect(document.documentElement).toHaveClass('dark');
});
```

### C. Formularios Interactivos
```tsx
test('maneja casos límite en los cálculos', async () => {
  renderComponent();
  
  // Caso límite: valores mínimos permitidos
  llenarFormulario({
    'input-consumo-mensual': '1',
    'input-precio-electricidad': '300',
    'input-horas-sol': '1',
    'input-inversion-inicial': '1000000'
  });
  
  const btnCalcular = screen.getByTestId('btn-calcular');
  fireEvent.click(btnCalcular);

  await waitFor(() => {
    expect(screen.getByTestId('resultado-calculo')).toBeInTheDocument();
  });
});
```

## Configuración Global

La configuración global de los tests se encuentra en `src/setupTests.ts`. Este archivo:
- Configura los mocks necesarios para ResizeObserver, matchMedia y localStorage
- Define tipos globales para TypeScript
- Configura utilidades de testing comunes

## Ejecución de Tests

Para ejecutar todos los tests:
```bash
npm test
```

Para ejecutar tests específicos:
```bash
# Ejecutar tests de un componente específico
npm test -- --testPathPattern=RetornoInversionChart

# Ejecutar tests relacionados con el tema
npm test -- --testPathPattern=ThemeProvider

# Ejecutar solo los tests que han fallado
npm test -- --onlyFailures
```

## Recursos Adicionales
- [Documentación de Jest](https://jestjs.io/docs/getting-started)
- [Documentación de React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Guía de Testing de Recharts](https://recharts.org/en-US/guide/testing)

[← Volver al Índice](../README.md)