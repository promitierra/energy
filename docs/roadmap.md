# Roadmap de Desarrollo

Este documento detalla el plan de desarrollo del Dashboard Comparativo de Energía, organizado por fases y prioridades.

## Fase 1: Fundamentos Esenciales - 🎯 Prioridad Alta (Alto impacto, baja complejidad)
- ✅ Implementar simulador personalizado de escenarios básico
- ✅ Crear visualización simple de costos acumulados
- 🔄 Implementar entrada de datos básicos del usuario (consumo, tarifa)
- 🔄 Integrar datos históricos de tarifas eléctricas

## Fase 2: Funcionalidades Core - 🎯 Prioridad Alta (Alto impacto, complejidad media)
- ✅ Mejorar asistente de toma de decisiones
- ✅ Ampliar análisis de retorno de inversión
- 🔄 Implementar sistema de recomendaciones básico
- 🔄 Añadir comparativas de emisiones CO₂
- 🔄 Crear calculadora básica de dimensionamiento

## Fase 3: Optimización y Precisión - 📊 Prioridad Media (Impacto medio, complejidad media)
- 🔜 Refinamiento de modelos predictivos
- 🔜 Implementar tracking de precios de equipos
- 🔜 Mejorar precisión de cálculos con datos reales
- 🔜 Añadir análisis de sensibilidad avanzado
- 🔄 Integrar datos climáticos por región

### Fase 3.1: Mejoras en Testing - 🧪 Prioridad Alta (Para estabilidad del proyecto)
- ✅ Resolver problemas con tests de componentes Recharts
- 🔄 Mejorar los mocks para servicios externos
- 🔄 Implementar tests de integración más completos
- 🔜 Establecer un pipeline de CI/CD para pruebas automáticas

### Fase 3.2: Migración a Datos Persistentes - 📦 Prioridad Alta (Para escalabilidad y mantenimiento)
- 🔜 Migrar datos hardcodeados a archivos JSON (Fase 1: datos de tarifas)
- 🔜 Implementar validación de esquemas para datos JSON
- 🔜 Crear tests unitarios para validación de datos
- 🔜 Migrar configuraciones de componentes a JSON (Fase 2: parámetros de simulación)
- 🔜 Desarrollar tests de integración para persistencia de datos
- 🔜 Migrar datos de emisiones y factores de conversión a JSON (Fase 3)

### Fase 3.3: Despliegue y Accesibilidad - 🌐 Prioridad Alta (Para disponibilidad pública)
- 🔜 Configurar GitHub Actions para despliegue automático
- 🔜 Publicar aplicación en GitHub Pages
- 🔜 Implementar compresión y optimización para producción
- 🔜 Añadir soporte para caché de datos persistentes
- 🔜 Crear documentación de uso público

## Fase 4: Características Avanzadas - 🚀 Prioridad Media (Impacto medio, alta complejidad)
- 📅 Análisis OCR de facturas
- 📅 Validación con datos reales de instalaciones
- 📅 Sistema de machine learning para predicciones
- 📅 Integración con APIs de proveedores

## Fase 5: Refinamientos - 💡 Prioridad Baja (Bajo impacto, complejidad variable)
- 📅 Personalización avanzada de interfaz
- 📅 Módulo de reportes personalizados
- 📅 Comparativas regionales avanzadas

## Leyenda
- ✅ Completado
- 🔄 En progreso
- 🔜 Planificado próximamente
- 📅 Planificado a futuro

[← Volver al Índice](../README.md)