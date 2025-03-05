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
- Jest y React Testing Library para pruebas

## Estructura del proyecto
```
energy-dashboard/
├── public/          # Recursos estáticos
├── src/
│   ├── components/  # Componentes reutilizables
│   │   ├── DecisionGuide.tsx        # Asistente de toma de decisiones
│   │   ├── SimuladorPersonalizado.tsx # Simulador de escenarios
│   │   └── ui/
│   │       └── card.tsx             # Componentes de UI reutilizables
│   ├── theme/
│   │   └── ThemeProvider.tsx        # Proveedor de tema claro/oscuro
│   ├── App.tsx                # Componente raíz de la aplicación
│   ├── Dashboard.tsx          # Dashboard principal
│   ├── graficos-comparativos.tsx  # Visualizaciones de los datos
│   │── tests/                 # Pruebas unitarias y de integración
│   │   └── ...
│   └── ...                    # Otros archivos de configuración y utilidades
└── ...                        # Archivos de configuración del proyecto
```

## Instalación y configuración

1. Clona el repositorio:
```
git clone https://github.com/usuario/energy-dashboard.git
cd energy-dashboard
```

2. Instala las dependencias:
```
npm install
```

3. Inicia el servidor de desarrollo:
```
npm start
```

4. Abre http://localhost:3000 en tu navegador

5. Para ejecutar las pruebas:
```
npm test
```

## Roadmap de desarrollo

### Fase 1: Fundamentos Esenciales - 🎯 Prioridad Alta (Alto impacto, baja complejidad)
- ✅ Implementar simulador personalizado de escenarios básico
- ✅ Crear visualización simple de costos acumulados
- 🔄 Implementar entrada de datos básicos del usuario (consumo, tarifa)
- 🔄 Integrar datos históricos de tarifas eléctricas

### Fase 2: Funcionalidades Core - 🎯 Prioridad Alta (Alto impacto, complejidad media)
- ✅ Mejorar asistente de toma de decisiones
- ✅ Ampliar análisis de retorno de inversión
- 🔄 Implementar sistema de recomendaciones básico
- 🔄 Añadir comparativas de emisiones CO₂
- 🔄 Crear calculadora básica de dimensionamiento

### Fase 3: Optimización y Precisión - 📊 Prioridad Media (Impacto medio, complejidad media)
- 🔜 Refinamiento de modelos predictivos
- 🔜 Implementar tracking de precios de equipos
- 🔜 Mejorar precisión de cálculos con datos reales
- 🔜 Añadir análisis de sensibilidad avanzado
- 🔄 Integrar datos climáticos por región

### Fase 4: Características Avanzadas - 🚀 Prioridad Media (Impacto medio, alta complejidad)
- 📅 Análisis OCR de facturas
- 📅 Validación con datos reales de instalaciones
- 📅 Sistema de machine learning para predicciones
- 📅 Integración con APIs de proveedores

### Fase 5: Refinamientos - 💡 Prioridad Baja (Bajo impacto, complejidad variable)
- 📅 Personalización avanzada de interfaz
- 📅 Módulo de reportes personalizados
- 📅 Comparativas regionales avanzadas

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
