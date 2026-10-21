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
- Tailwind CSS 4 para los estilos
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

## Guía de instalación

### 1. Requisitos

- Git para clonar el repositorio.
- Node.js 22 (versión 22.12.0 o posterior de esa rama) y npm 11.
- Un navegador moderno: Safari 16.4+, Chrome 111+ o Firefox 128+, según los
  [requisitos de Tailwind 4](https://tailwindcss.com/docs/upgrade-guide#browser-requirements).

Instala Node desde [su sitio oficial](https://nodejs.org/en/download) o tu
administrador de versiones. Comprueba las versiones en una terminal:

```bash
node --version
npm --version
```

Si tienes Node 22 compatible pero npm es anterior a 11, actualiza npm:

```bash
npm install --global npm@11
```

El proyecto declara Node `^20.19.0 || >=22.12.0`; la instalación se verificó
con Node 22.23.3 y npm 11.21.1. npm 9 y 10 presentaron un error interno del
resolvedor (`edgesOut`) al actualizar el lockfile.

### 2. Descargar e instalar

```bash
git clone https://github.com/promitierra/energy.git
cd energy
npm ci
```

Si ya tienes el repositorio, abre una terminal en su directorio y ejecuta
`npm ci`. Este comando instala las versiones de `package-lock.json` y reemplaza
el contenido de `node_modules/`. No requiere Python, una base de datos ni
credenciales de servicios externos para ejecutar el dashboard.

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000. Vite actualiza la página al guardar cambios.
Usa la URL que muestre la terminal si el puerto está ocupado. Para elegir
otro puerto explícitamente:

```bash
npm run dev -- --port 3001
```

Detén el servidor con `Ctrl+C`.

### 4. Verificar y compilar

```bash
npm test -- --run
npm run build
npm run preview
```

Las pruebas se ejecutan una vez. La compilación verifica TypeScript y genera
el sitio estático en `build/`. La previsualización local suele estar en
http://localhost:4173; comprueba la URL indicada por la terminal.

Para publicar, sirve el contenido de `build/` con un alojamiento de archivos
estáticos. `npm run preview` permite revisar la compilación localmente; no es
el servidor recomendado para producción.

### ¿Se necesita un entorno virtual o Uvicorn?

**Para el dashboard, no.** Es una aplicación React/Vite y sus dependencias se
instalan localmente en `node_modules/` mediante npm. Uvicorn es un servidor
ASGI para aplicaciones web Python; no crea entornos virtuales y este proyecto
no tiene un backend ASGI que necesite ejecutarlo.

**Solo para los gráficos de investigación opcionales**, conviene aislar las
dependencias Python en un entorno virtual. No hace falta ejecutar estos pasos
para usar el dashboard. Con Python 3 y su módulo `venv` disponibles, desde la
raíz del repositorio, crea el entorno fuera del checkout:

```bash
# Linux/macOS
python3 -m venv ../energy-research-venv
source ../energy-research-venv/bin/activate
python -m pip install -r docs/investigacion/visualizaciones/requirements.txt
```

En Windows PowerShell:

```powershell
py -3 -m venv ..\energy-research-venv
..\energy-research-venv\Scripts\Activate.ps1
python -m pip install -r docs/investigacion/visualizaciones/requirements.txt
```

Consulta las instrucciones de uso en
[la documentación de visualizaciones](docs/investigacion/visualizaciones/README.md).
Al terminar, ejecuta `deactivate`. Si más adelante se añade una API Python
ASGI, entonces se podrá evaluar Uvicorn para servirla dentro de ese entorno.

### Problemas frecuentes

- **`node` o `npm` no se encuentra:** instala Node y vuelve a abrir la terminal.
- **`EBADENGINE` o `edgesOut`:** verifica que la terminal use Node 22 compatible
  y npm 11; después vuelve a ejecutar `npm ci`.
- **`tsc` o `vitest` no se encuentra:** ejecuta `npm ci` desde la raíz del
  repositorio e invoca las herramientas mediante los comandos `npm` anteriores.
- **Puerto ocupado:** usa `npm run dev -- --port 3001` y abre la URL indicada.

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

La compilación y la suite de pruebas pasan; la auditoría de dependencias no reporta
vulnerabilidades. Se verificaron los flujos reales y la accesibilidad automática
en Chromium en ambos temas. Queda ampliar la validación entre navegadores,
lectores de pantalla y rendimiento.
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

### Simulación y características de equipos

El simulador permite editar paneles, inversores, baterías y características descriptivas adicionales. Consulte el [modelo de simulación](docs/modelo-simulacion.md) para las ecuaciones, unidades, ejemplo reproducible, limitaciones y fuentes técnicas.


### Proyectos conectados y aislados

En el simulador, seleccione **On-grid** u **Off-grid**. Los gráficos se acompañan
con tablas. Las sugerencias comparan paneles, baterías e inversor configurados
con el mínimo del objetivo; para off-grid se solicitan autonomía y carga
simultánea. Los faltantes aislados se reportan como demanda sin cubrir, no como
compras de red. Consulte los [criterios y límites de dimensionamiento](docs/modelo-simulacion.md#tipo-de-proyecto-y-mínimos-sugeridos).
