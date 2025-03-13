# Guía de Uso del Sistema OCR para Análisis de Facturas

## Introducción

El sistema de Reconocimiento Óptico de Caracteres (OCR) implementado en la aplicación Energy permite extraer automáticamente información relevante de facturas de servicios públicos (electricidad, gas, etc.) mediante el análisis de imágenes. Esta funcionalidad facilita la incorporación de datos de consumo y costos al simulador personalizado, ahorrando tiempo y reduciendo errores de entrada manual. El sistema está optimizado para el mercado colombiano, con conversión automática de valores y estimación de inversión inicial.

## Características Principales

- **Procesamiento de imágenes**: Carga, recorte y rotación de imágenes de facturas
- **Reconocimiento automático**: Extracción de datos clave como compañía, período de facturación, importe total, consumo y tarifa
- **Validación de resultados**: Sistema de confianza que indica la fiabilidad de los datos extraídos
- **Corrección manual**: Interfaz para revisar y corregir los datos extraídos antes de su uso
- **Integración con el simulador**: Transferencia directa de los datos procesados al simulador personalizado

## Requisitos para Obtener Mejores Resultados

### Calidad de la Imagen

Para obtener los mejores resultados del sistema OCR, se recomienda:

- Utilizar imágenes con buena iluminación y contraste
- Evitar sombras o reflejos sobre la factura
- Asegurar que el texto sea claramente legible
- Preferir fotografías frontales, evitando ángulos pronunciados
- Utilizar una resolución mínima de 300 DPI

### Formatos Soportados

El sistema acepta los siguientes formatos de imagen:

- JPG/JPEG
- PNG
- BMP
- TIFF

## Proceso de Uso

### 1. Carga de la Imagen

1. Acceda a la sección "Análisis OCR de Facturas" en la aplicación
2. Haga clic en el botón "Seleccionar Factura"
3. Seleccione la imagen de la factura desde su dispositivo
4. La aplicación mostrará una vista previa y evaluará automáticamente la calidad de la imagen

### 2. Ajustes de la Imagen

Si la imagen requiere ajustes:

1. Utilice el control deslizante de rotación para corregir la orientación
2. Utilice la herramienta de recorte para seleccionar solo el área de la factura con la información relevante
3. Confirme los ajustes realizados

### 3. Procesamiento OCR

1. Haga clic en el botón "Procesar Factura"
2. Espere mientras el sistema analiza la imagen (este proceso puede tomar unos segundos)
3. El sistema mostrará un indicador de progreso durante el procesamiento

### 4. Revisión y Corrección de Resultados

Una vez completado el procesamiento:

1. Revise los datos extraídos en la sección de resultados
2. Verifique el nivel de confianza general y por campo
3. Si es necesario, corrija manualmente cualquier dato incorrecto o no detectado
4. Confirme los datos finales haciendo clic en "Confirmar Datos"

### 5. Integración con el Simulador

1. Haga clic en "Aplicar al Simulador" para utilizar los datos en el simulador personalizado
2. Los datos extraídos se cargarán automáticamente en los campos correspondientes del simulador
3. El sistema realizará automáticamente las siguientes adaptaciones para el mercado colombiano:
   - Conversión de tarifas europeas a pesos colombianos (aproximadamente 4500 COP por EUR)
   - Estimación de inversión inicial basada en el consumo detectado (aproximadamente 5000 COP por kWh)
   - Aplicación de valores predeterminados optimizados para Colombia: 5 horas de sol diarias, 20% de eficiencia de paneles y 25 años de vida útil
4. Verifique y ajuste los valores según sea necesario antes de proceder con la simulación
5. Proceda con la simulación utilizando los datos extraídos

## Tipos de Facturas Soportadas

El sistema está optimizado para reconocer facturas de los siguientes proveedores:

- **Electricidad**: Iberdrola, Endesa, Naturgy, Repsol, Total Energies
- **Gas Natural**: Naturgy, Endesa, Iberdrola, Repsol

Para otros proveedores, el sistema intentará extraer la información, pero la precisión puede variar.

## Solución de Problemas Comunes

### Baja Confianza en los Resultados

Si el sistema muestra una advertencia de baja confianza:

1. Verifique la calidad de la imagen (iluminación, enfoque, resolución)
2. Intente recortar la imagen para incluir solo la sección con los datos relevantes
3. Asegúrese de que la factura corresponde a uno de los proveedores soportados
4. Corrija manualmente los datos con baja confianza

### Fallo en el Procesamiento

Si el sistema no puede procesar la imagen:

1. Verifique que el formato de la imagen es compatible
2. Intente con una imagen de mayor resolución
3. Asegúrese de que la imagen no está dañada o corrupta
4. Intente preprocesar la imagen con una aplicación externa para mejorar el contraste

### Datos No Detectados

Si algunos campos específicos no son detectados:

1. Verifique que la información está visible y legible en la imagen
2. Intente con un recorte más preciso enfocado en la sección con los datos faltantes
3. Ingrese manualmente los datos no detectados en los campos correspondientes

## Consideraciones de Privacidad

- Las imágenes de facturas se procesan localmente en su dispositivo
- No se almacenan copias completas de las facturas en servidores externos
- Solo se guardan los datos extraídos relevantes para el simulador
- Puede eliminar el historial de facturas procesadas desde la configuración de la aplicación

## Ejemplos Prácticos

### Ejemplo 1: Factura de Electricidad

1. Cargue una imagen de una factura de electricidad de Iberdrola
2. El sistema detectará automáticamente:
   - Compañía: Iberdrola
   - Período de facturación: 01/01/2023 - 31/01/2023
   - Importe total: 85,50€
   - Consumo: 350 kWh
   - Precio: 0,25€/kWh
3. Verifique y confirme los datos
4. Transfiera al simulador para analizar alternativas de ahorro

### Ejemplo 2: Factura de Gas Natural

1. Cargue una imagen de una factura de gas natural de Naturgy
2. El sistema detectará automáticamente:
   - Compañía: Electrocaquetá
   - Período de facturación: 01/03/2025 - 31/03/2025
   - Importe total: 180.000$
   - Consumo: 283 kWh
   - Precio: 920$/kWh
3. Verifique y confirme los datos
4. Transfiera al simulador para comparar con alternativas eléctricas

## Limitaciones Actuales

- El sistema puede tener dificultades con facturas muy complejas o con formatos no estándar
- Algunas facturas con sellos de agua o marcas de seguridad pueden afectar la precisión
- Facturas en idiomas diferentes al español pueden no ser reconocidas correctamente
- La extracción de datos de tablas complejas puede requerir ajustes manuales

## Próximas Mejoras

Estamos trabajando en las siguientes mejoras para el sistema OCR:

- Soporte para más proveedores de servicios públicos
- Mejora en la precisión de reconocimiento para facturas con baja calidad
- Capacidad de procesar facturas en formato PDF
- Reconocimiento automático de patrones para nuevos formatos de facturas
- Análisis histórico de consumo basado en múltiples facturas

## Contacto y Soporte

Si encuentra problemas con el sistema OCR o tiene sugerencias para mejorarlo, por favor contacte con nuestro equipo de soporte a través de la sección de ayuda de la aplicación o envíe un correo electrónico a energy@promitierra.org
