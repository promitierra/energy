# Dashboard Comparativo de Energía

## Descripción
Este proyecto proporciona un dashboard interactivo para comparar diferentes alternativas de generación de energía para uso domiciliario: red eléctrica convencional, paneles solares fotovoltaicos y generadores a gas. La herramienta ofrece visualizaciones gráficas de costos, retorno de inversión e impacto ambiental, así como un asistente de decisión interactivo y un simulador personalizado para ayudar a los usuarios a determinar la mejor opción según sus circunstancias particulares.

## Características principales
- **Visualizaciones de datos**: Gráficos interactivos que muestran comparativas de costos, emisiones de CO₂ y retorno de inversión
- **Análisis detallado**: Desglose de componentes de costo y análisis de sensibilidad
- **Simulador personalizado**: Herramienta para modificar parámetros y evaluar diferentes escenarios
- **Asistente de decisión**: Herramienta interactiva basada en preguntas para obtener recomendaciones personalizadas
- **Interfaz intuitiva**: Diseño limpio y responsive con explicaciones claras
- **Modo oscuro**: Soporte para tema claro y oscuro que respeta las preferencias del sistema

## Tecnologías utilizadas
- React con TypeScript
- Recharts para visualizaciones de datos
- Tailwind CSS para los estilos
- Vite para desarrollo y compilación
- Vitest y React Testing Library para pruebas

## Estructura del proyecto
```
energy-dashboard/
├── public/          # Recursos estáticos
├── src/
│   ├── components/  # Componentes reutilizables
│   │   ├── DecisionGuide.tsx        # Asistente de toma de decisiones
│   │   ├── SimuladorPersonalizado.tsx # Simulador de escenarios
│   │   ├── charts/                  # Componentes de gráficos
│   │   │   └── RetornoInversionChart.tsx # Gráfico de retorno de inversión
│   │   └── ui/
│   │       └── card.tsx             # Componentes de UI reutilizables
│   ├── theme/
│   │   └── ThemeProvider.tsx        # Proveedor de tema claro/oscuro
│   ├── App.tsx                # Componente raíz de la aplicación
│   ├── Dashboard.tsx          # Dashboard principal
│   ├── graficos-comparativos.tsx  # Visualizaciones de los datos
│   │── tests/                 # Pruebas unitarias y de integración
│   │   ├── __mocks__/         # Mocks para testing
│   │   │   └── resizeObserver.js # Mock de ResizeObserver para tests de Recharts
│   │   └── components/
│   │       └── charts/        # Tests para componentes de gráficos
│   │           └── RetornoInversionChart.test.tsx
│   └── ...                    # Otros archivos de configuración y utilidades
└── ...                        # Archivos de configuración del proyecto
```

## Instalación y configuración

Requiere Node.js `^20.19.0 || >=22.12.0` (se recomienda Node 22) y npm 11.
La instalación se verificó con Node 22/npm 11; npm 9 y 10 presentaron un error
interno del resolvedor de dependencias (`edgesOut`) al actualizar el lockfile.
Desde el directorio del repositorio:

```bash
npm ci
npm run dev
```

El servidor abre http://localhost:3000. Para compilar y previsualizar:

```bash
npm run build
npm run preview
```

La compilación ejecuta TypeScript y Vite y genera `build/`.

## Testing con Recharts, ThemeProvider y Formularios
Este proyecto incluye tests para diferentes tipos de componentes: gráficos con Recharts, componentes que dependen del tema, y formularios interactivos. Para lograr un correcto funcionamiento de los tests, se implementó:

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
- Se limpia en los tests que requieren aislamiento
- Simula correctamente todos los métodos del API de localStorage

### 4. Patrones de Testing Establecidos

#### A. Selectores en Tests

Preferir roles y nombres accesibles (`getByRole`, `getByLabelText`) para
comprobar la interfaz que percibe el usuario. Utilizar `data-testid` cuando no
haya un selector semántico adecuado.

#### B. Accesibilidad y Testing
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

#### C. Funciones de Ayuda Reutilizables
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

### 5. Testing de Componentes Específicos

#### A. Componentes con Recharts
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

#### B. Componentes con Tema
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

#### C. Formularios Interactivos
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

### 6. Configuración Global

La configuración global de los tests se encuentra en `src/setupTests.ts`. Este archivo:
- Configura los mocks necesarios para ResizeObserver, matchMedia y localStorage
- Define tipos globales para TypeScript
- Configura utilidades de testing comunes

### 7. Ejecución de Tests

```bash
# Ejecución completa, sin modo interactivo
npm test -- --run

# Pruebas de un archivo
npm test -- --run src/tests/ThemeProvider.test.tsx

# Modo interactivo de Vitest
npm test
```

La configuración activa está en `vite.config.ts`; `jest.config.js` es un
archivo heredado y no se usa con estos comandos. Los resultados y las tareas
pendientes se mantienen en [el roadmap de pruebas](docs/test-errors-roadmap.md).

## Estado y roadmap

Implementados: las tres secciones del dashboard, cinco gráficos comparativos,
entrada de consumo y tarifa, cálculo solar personalizado, recomendaciones
basadas en preguntas, tema persistente, carga diferida y pruebas unitarias y
de integración del dashboard. Las comparativas usan datos definidos en el
código; no incluyen tarifas ni precios de equipos en tiempo real.

El foco actual es estabilizar las pruebas y validar accesibilidad y rendimiento.
El detalle está en [Fase 3](docs/fase3-desarrollo.md).

Quedan como evolución futura la integración de tarifas y clima por región,
validación con instalaciones reales, seguimiento de precios, OCR de facturas,
reportes personalizados e integración con proveedores. Estas capacidades no
están implementadas. Las respuestas del asistente se conservan durante su uso,
pero se reinician al desmontarlo o recargar la página.

## Uso
El dashboard ofrece tres secciones principales:
1. **Gráficos Comparativos**: Visualizaciones de datos que comparan las tres alternativas energéticas.
2. **Simulador Personalizado**: Permite ajustar parámetros como consumo, tarifas e inversión para crear escenarios personalizados.
3. **Asistente de Decisión**: Guía paso a paso con preguntas para obtener una recomendación personalizada.
Para cambiar entre el modo claro y oscuro, haz clic en el botón de tema en la esquina superior derecha. El dashboard respeta automáticamente tu preferencia de tema definida en el sistema operativo.

## Licencia
Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Contribuciones
Las contribuciones son bienvenidas. Por favor, abrir un issue primero para discutir los cambios que te gustaría realizar.

## Reconocimientos
- Datos obtenidos de estudios de mercado de sistemas energéticos en Colombia
- Inspirado en comparativas de eficiencia energética y sostenibilidad
