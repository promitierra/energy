# Fase 3: Pruebas y optimización

## Implementado

- Dashboard con análisis comparativo, simulador solar y asistente de decisión.
- Cinco gráficos: costos acumulados, retorno de inversión, emisiones de CO₂,
  estructura de costos y sensibilidad.
- Tema claro/oscuro con preferencia del sistema y persistencia en localStorage.
- Persistencia de la pestaña activa y navegación mediante el hash de la URL.
- Carga diferida con React.lazy/Suspense, estados de carga, memoización,
  precarga de gráficos y límites de error para gráficos.
- Enlace para saltar al contenido, etiquetas de formulario, anuncios y manejo
  de foco en el asistente; relación ARIA entre pestañas y panel activo.
- Pruebas de componentes, ThemeProvider, formularios, gráficos, utilidades y
  navegación/persistencia del dashboard.

La existencia de estas medidas no acredita por sí sola rendimiento ni
cumplimiento de WCAG. Las pruebas de integración del dashboard sustituyen sus
secciones con mocks; no equivalen a una prueba completa en navegador.

## Trabajo pendiente

- Mantener una ejecución reproducible de instalación, compilación y Vitest;
  consultar el resultado más reciente en [el roadmap de pruebas](test-errors-roadmap.md).
- Ampliar la integración con componentes reales para cubrir el cuestionario
  completo y la actualización de resultados del simulador.
- Auditar navegación por teclado, foco, contraste y lectores de pantalla en
  ambos temas con herramientas como axe/Lighthouse y comprobaciones manuales.
- Medir rendimiento antes de decidir nuevas optimizaciones.
- Validar modelos y datos con instalaciones reales; las comparativas actuales
  usan datos definidos en el código, sin un servicio de tarifas en tiempo real.

## Verificación local

Se requiere Node.js `^20.19.0 || >=22.12.0`.

```bash
npm ci
npm run build
npm test -- --run
```

La configuración activa es Vite/Vitest (`vite.config.ts`), con entorno jsdom y
preparación compartida en `src/setupTests.ts`.
