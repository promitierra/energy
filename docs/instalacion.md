# Instalación y Configuración

## Requisitos Previos
- Node.js (versión recomendada: 14.x o superior)
- npm (incluido con Node.js)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

## Pasos de Instalación

### 1. Clonar el Repositorio
```bash
git clone https://github.com/usuario/energy-dashboard.git
cd energy-dashboard
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Iniciar el Servidor de Desarrollo
```bash
npm start
```

### 4. Acceder a la Aplicación
Abra su navegador y visite: http://localhost:3000

## Configuración Adicional

### Variables de Entorno
Puede personalizar la configuración creando un archivo `.env` en la raíz del proyecto:

```
REACT_APP_API_URL=https://su-api-personalizada.com
REACT_APP_DEBUG_MODE=false
```

### Configuración para Producción
Para crear una versión optimizada para producción:

```bash
npm run build
```

Los archivos generados se encontrarán en el directorio `build/`.

## Ejecución de Pruebas

### Ejecutar Todas las Pruebas
```bash
npm test
```

### Ejecutar Pruebas Específicas
```bash
# Ejecutar tests de un componente específico
npm test -- --testPathPattern=RetornoInversionChart

# Ejecutar tests relacionados con el tema
npm test -- --testPathPattern=ThemeProvider

# Ejecutar solo los tests que han fallado
npm test -- --onlyFailures
```

## Solución de Problemas Comunes

### Error: "Cannot find module"
Si encuentra este error, intente:

```bash
npm clean-install
```

### Problemas con el Hot Reloading
Si los cambios no se reflejan automáticamente:

1. Detenga el servidor (Ctrl+C)
2. Elimine la caché: `npm run clean`
3. Reinicie el servidor: `npm start`

[← Volver al Índice](../README.md)