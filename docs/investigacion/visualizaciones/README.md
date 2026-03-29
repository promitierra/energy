# Visualizaciones del Estudio de Pre-Factibilidad

Este directorio contiene los scripts de Python para generar gráficos profesionales que acompañan el estudio de pre-factibilidad de la empresa de energía solar en el Caquetá.

## 📊 Gráficos Generados

1. **01_radiacion_solar_colombia.png/svg** - Comparación de radiación solar en regiones de Colombia
2. **02_factores_climaticos_radar.png/svg** - Análisis radar de condiciones climáticas vs. ideales
3. **03_comparativa_tecnologias.png/svg** - PERC vs N-Type TOPCon (características técnicas)
4. **04_incentivos_fiscales_waterfall.png/svg** - Cascada de incentivos fiscales (Ley 1715)
5. **05_modelos_negocio_comparativo.png/svg** - Comparación de 5 modelos de negocio (ROI, inversión, complejidad)
6. **06_proyeccion_financiera_5_años.png/svg** - Proyección de ingresos, EBITDA y ROI acumulado
7. **07_mapa_calor_oportunidades.png/svg** - Matriz de oportunidades por segmento de mercado
8. **08_comparativa_precios_paneles.png/svg** - Análisis de 4 paneles solares recomendados

## 🚀 Uso

### Instalar dependencias

```bash
# Con uv (recomendado)
uv pip install -r requirements.txt

# O con pip
pip install -r requirements.txt
```

### Generar todos los gráficos

```bash
python generar_graficos_estudio.py
```

Los gráficos se generarán en el subdirectorio `graficos/` en dos formatos:
- **PNG** (300 DPI) - Para documentos, presentaciones, impresión
- **SVG** (vectorial) - Para edición, escalado sin pérdida de calidad

## 📦 Dependencias

- `matplotlib >= 3.8.0` - Generación de gráficos
- `numpy >= 1.26.0` - Operaciones numéricas
- `pandas >= 2.1.0` - Manipulación de datos
- `seaborn >= 0.13.0` - Estilos de visualización

## 🔧 Personalización

Para modificar los gráficos, edita `generar_graficos_estudio.py`:

```python
# Ejemplo: Cambiar colores del gráfico 1
colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']

# Ejemplo: Ajustar tamaño de figura
plt.rcParams['figure.figsize'] = (12, 8)

# Ejemplo: Cambiar resolución de PNG
plt.savefig('grafico.png', dpi=300)  # Cambiar a 150, 600, etc.
```

## 📄 Integración con el Estudio

Los gráficos están referenciados en el documento principal:
`../estudio-prefactibilidad-energia-solar-caqueta.md`

Para insertar en Markdown:
```markdown
![Descripción](visualizaciones/graficos/01_radiacion_solar_colombia.png)
```

## ⚠️ Notas sobre los Datos

Los gráficos están basados en los datos presentados en el estudio principal. **Consulta `../FUENTES_VALIDADAS.md`** para información sobre:
- Fuentes primarias de cada dato
- Datos que requieren validación directa
- Procedimientos de consulta con entidades oficiales

## 🔄 Actualización

Si los datos del estudio cambian, regenera los gráficos:

1. Edita los valores en las funciones correspondientes de `generar_graficos_estudio.py`
2. Ejecuta: `python generar_graficos_estudio.py`
3. Los gráficos se sobrescribirán automáticamente

## 📧 Contacto

Para consultas sobre las visualizaciones:
- Email: investigacion@promitierra.org
- Proyecto: Estudio de Pre-Factibilidad - Energía Solar Caquetá

---

**Última actualización**: 26 de febrero de 2026  
**Herramientas**: Python 3.10+, matplotlib, seaborn
