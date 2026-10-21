# Estado y mantenimiento de las pruebas

## Entorno y comandos

La configuración activa usa Vitest y jsdom en `vite.config.ts`, React Testing
Library y los mocks compartidos de `src/setupTests.ts`. `jest.config.js` es
heredado; no interviene en `npm test`.

Se requiere Node.js `^20.19.0 || >=22.12.0`. La instalación se verificó con
Node 22 y npm 11. npm 9 y 10 presentaron un fallo interno del resolvedor
(`edgesOut`) al actualizar las dependencias.

```bash
npm ci
npm run build
npm test -- --run
npm test -- --run src/tests/DecisionGuide.test.tsx
```

`npm test` sin `--run` activa el modo interactivo. No usar opciones propias de
Jest como `--testPathPattern` o `--onlyFailures`.

## Reparaciones verificadas

- Se alineó `@vitejs/plugin-react` con Vite 8 y se actualizó el lockfile.
- Se eliminaron imports duplicados de `vi` y se corrigieron los factories de
  mocks para devolver exports de módulo compatibles con Vitest.
- Las pruebas de integración limpian el hash de navegación entre casos.
- Las pestañas ahora enlazan al panel correcto mediante `aria-controls`, y el
  panel tiene nombre accesible mediante el ID de la pestaña. Una prueba recorre
  las tres pestañas y verifica ambas relaciones.
- Las pruebas del asistente reflejan la selección con avance automático,
  navegación hacia atrás, respuesta conservada, bloqueo sin selección,
  resultados y reinicio. El asistente no persiste respuestas al desmontarse o
  recargar; las pruebas anteriores suponían esa funcionalidad inexistente.
- Los puntajes del asistente se calculan desde las respuestas actuales.
  Cambiar una respuesta anterior ya no acumula puntos de ambas opciones.
  La regresión compara el resultado editado con el mismo conjunto de respuestas
  elegido directamente; se comprobó que fallaba antes de corregir el cálculo.

## Resultados

La primera ejecución tras corregir la instalación y los errores de migración
produjo **72 pruebas aprobadas y 7 fallidas**, todas del asistente. El registro
anterior de 66/78 correspondía a una ejecución histórica y no describía el
estado actual.

Verificación final del 21 de octubre de 2026 con Node 22.23.3 y npm 11.21.1:

- `npm ci`: instalación reproducible completada.
- `npm run build`: TypeScript y compilación de producción aprobados.
- `npm test -- --run`: **80/80 pruebas aprobadas en 15/15 archivos**.
- Auditoría de dependencias durante `npm ci`: **0 vulnerabilidades**.
- Chromium con Playwright y axe-core: **24 estados sin infracciones detectadas**
  de las reglas WCAG 2 A/AA y 2.1 AA (tres secciones, resultados del simulador,
  siete preguntas y resultados del asistente, en claro y oscuro).
- Se verificaron el salto al contenido, flecha derecha entre pestañas, cálculo
  con datos reales de formulario y enlace de resultados al simulador.
- Las tres secciones no desbordan horizontalmente a 390 px; no hubo errores
  JavaScript de página durante los recorridos.

## Actualización de dependencias y accesibilidad

Se eliminó node-forge, que no se utilizaba, y se actualizaron las dependencias
vulnerables y Browserslist. Tailwind 3 arrastraba dependencias sin corrección
compatible; se migró a Tailwind 4 y su plugin PostCSS conservando el tema por
clase y los estilos equivalentes de bordes, sombras, contornos y diálogos.
La compatibilidad mínima de navegador se documenta en el README.

Se corrigió el contraste de pestañas, descripciones y leyendas, se nombraron
los sectores de gráficos y se incorporó navegación de pestañas con flechas,
Home/End y un único punto de entrada por Tab, cubierta por una regresión.

## Trabajo pendiente y límites

- Incorporar los recorridos de navegador a CI; las pruebas de integración
  actuales de Vitest todavía usan mocks de las tres secciones.
- Comprobar Firefox, Safari y lectores de pantalla. Los resultados automáticos
  de Chromium no acreditan cumplimiento completo de WCAG.
- Revisar visualmente etiquetas y ejes de gráficos en tamaños estrechos y
  con zoom; la ausencia de desbordamiento de página no garantiza su legibilidad.
- Mantener la auditoría de dependencias: cero avisos describe esta ejecución,
  no una garantía de ausencia de vulnerabilidades futuras.
- Evaluar los avisos de dimensiones de Recharts en jsdom antes de suprimirlos.
- Mantener las cifras de esta página ligadas a ejecuciones reales, preferir
  selectores por rol/nombre accesible y aislar estado de navegación entre tests.
