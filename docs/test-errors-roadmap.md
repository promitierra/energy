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
- `npm test -- --run`: **79/79 pruebas aprobadas en 15/15 archivos**.
- Verificación enfocada de Dashboard y DecisionGuide: **15/15 aprobadas**.

## Trabajo pendiente y límites

- Ampliar integración con componentes reales: los flujos del dashboard usan
  mocks de sus tres secciones; no sustituyen una prueba completa de navegador.
- Auditar teclado, foco y contraste en ambos temas. Las relaciones ARIA y los
  tests unitarios no acreditan cumplimiento completo de WCAG.
- Revisar las dependencias: `npm ci` reportó **21 vulnerabilidades**
  (1 baja, 6 moderadas y 14 altas). No se aplicaron actualizaciones ajenas a la
  compatibilidad necesaria para instalar; los tests no validan su seguridad.
- Actualizar la base de Browserslist, que genera un aviso de antigüedad, y
  evaluar los avisos de dimensiones de Recharts en jsdom antes de suprimirlos.
- Mantener las cifras de esta página ligadas a ejecuciones reales, preferir
  selectores por rol/nombre accesible y aislar estado de navegación entre tests.
