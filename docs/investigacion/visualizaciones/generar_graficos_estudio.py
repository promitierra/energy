"""
Generador de Gráficos para Estudio de Pre-Factibilidad
Empresa de Energía Solar - Caquetá

Genera visualizaciones profesionales para el análisis de viabilidad
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import pandas as pd
import seaborn as sns
from pathlib import Path

# Configuración de estilo
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 10
plt.rcParams['axes.titlesize'] = 14
plt.rcParams['axes.labelsize'] = 12
plt.rcParams['xtick.labelsize'] = 10
plt.rcParams['ytick.labelsize'] = 10
plt.rcParams['legend.fontsize'] = 10

# Crear directorio de salida
OUTPUT_DIR = Path(__file__).parent / "graficos"
OUTPUT_DIR.mkdir(exist_ok=True)


def grafico_1_radiacion_solar_colombia():
    """
    Gráfico comparativo de radiación solar en diferentes regiones de Colombia
    Fuente: Global Solar Atlas - World Bank Group (2025)
    """
    regiones = ['La Guajira', 'Caquetá\n(Florencia)', 'Caquetá\n(San Vicente)', 
                'Bogotá', 'Antioquia\n(Medellín)']
    hps_promedio = [6.0, 4.5, 4.8, 4.2, 3.8]
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
    
    fig, ax = plt.subplots(figsize=(12, 7))
    bars = ax.bar(regiones, hps_promedio, color=colors, edgecolor='black', linewidth=1.5)
    
    # Añadir valores sobre las barras
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{height} HPS',
                ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    ax.set_ylabel('Horas Pico Solar (HPS/día)', fontsize=12, fontweight='bold')
    ax.set_xlabel('Región', fontsize=12, fontweight='bold')
    ax.set_title('Comparación de Radiación Solar en Colombia\n(Promedio Anual)',
                 fontsize=14, fontweight='bold', pad=20)
    ax.axhline(y=4.5, color='red', linestyle='--', linewidth=2, alpha=0.7,
               label='Umbral óptimo para proyectos solares (4.5 HPS)')
    ax.legend(loc='upper right')
    ax.set_ylim(0, 7)
    ax.grid(axis='y', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / '01_radiacion_solar_colombia.png', dpi=300, bbox_inches='tight')
    plt.savefig(OUTPUT_DIR / '01_radiacion_solar_colombia.svg', format='svg', bbox_inches='tight')
    print("✓ Gráfico 1 generado: Radiación solar en Colombia")
    plt.close()


def grafico_2_factores_climaticos_caqueta():
    """
    Gráfico radar de factores climáticos que afectan eficiencia FV
    """
    categorias = ['Radiación\nSolar', 'Temperatura\n(favorable)', 'Humedad\n(desafío)',
                  'Nubosidad\n(desafío)', 'Limpieza\nNatural']
    
    # Valores normalizados 0-100
    caqueta = [75, 85, 35, 40, 90]  # Caquetá
    ideal = [95, 90, 90, 95, 80]    # Condiciones ideales
    
    # Cerrar el polígono
    caqueta += caqueta[:1]
    ideal += ideal[:1]
    categorias += [categorias[0]]
    
    # Ángulos para cada categoría
    angles = np.linspace(0, 2 * np.pi, len(categorias), endpoint=True)
    
    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(projection='polar'))
    
    ax.plot(angles, ideal, 'o-', linewidth=2, label='Condiciones ideales', color='green', alpha=0.7)
    ax.fill(angles, ideal, alpha=0.15, color='green')
    
    ax.plot(angles, caqueta, 'o-', linewidth=2, label='Caquetá (real)', color='#4ECDC4')
    ax.fill(angles, caqueta, alpha=0.3, color='#4ECDC4')
    
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categorias[:-1], fontsize=11)
    ax.set_ylim(0, 100)
    ax.set_yticks([25, 50, 75, 100])
    ax.set_yticklabels(['25%', '50%', '75%', '100%'], fontsize=9)
    ax.set_title('Análisis de Condiciones Climáticas para FV\nCaquetá vs. Condiciones Ideales',
                 fontsize=14, fontweight='bold', pad=30, y=1.08)
    ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / '02_factores_climaticos_radar.png', dpi=300, bbox_inches='tight')
    plt.savefig(OUTPUT_DIR / '02_factores_climaticos_radar.svg', format='svg', bbox_inches='tight')
    print("✓ Gráfico 2 generado: Factores climáticos (radar)")
    plt.close()


def grafico_3_comparativa_tecnologias():
    """
    Comparación de tecnologías fotovoltaicas: PERC vs N-Type
    """
    categorias = ['Eficiencia\nInicial (%)', 'Degradación\nAño 1 (%)', 'Degradación\nAnual (%)',
                  'Vida Útil\n(años)', 'Costo\n(COP/Wp)']
    
    perc = [21.0, 2.5, 0.55, 25, 1625]
    n_type = [22.5, 1.0, 0.40, 30, 2100]
    
    # Normalizar valores para visualización (excepto los que ya están en % o años)
    perc_norm = [21.0, 2.5, 0.55, 25, 1625/100]
    n_type_norm = [22.5, 1.0, 0.40, 30, 2100/100]
    
    x = np.arange(len(categorias))
    width = 0.35
    
    fig, ax = plt.subplots(figsize=(14, 8))
    bars1 = ax.bar(x - width/2, perc_norm, width, label='Monocristalino PERC', 
                   color='#FF6B6B', edgecolor='black', linewidth=1.2)
    bars2 = ax.bar(x + width/2, n_type_norm, width, label='N-Type TOPCon',
                   color='#4ECDC4', edgecolor='black', linewidth=1.2)
    
    # Añadir valores sobre las barras
    for i, (bar1, bar2) in enumerate(zip(bars1, bars2)):
        height1 = bar1.get_height()
        height2 = bar2.get_height()
        
        if i < 4:  # Para las primeras 4 categorías (no el costo)
            ax.text(bar1.get_x() + bar1.get_width()/2., height1,
                    f'{perc[i]:.1f}' if i < 3 else f'{int(perc[i])}',
                    ha='center', va='bottom', fontsize=9)
            ax.text(bar2.get_x() + bar2.get_width()/2., height2,
                    f'{n_type[i]:.1f}' if i < 3 else f'{int(n_type[i])}',
                    ha='center', va='bottom', fontsize=9)
        else:  # Para el costo
            ax.text(bar1.get_x() + bar1.get_width()/2., height1,
                    f'${int(perc[i])}',
                    ha='center', va='bottom', fontsize=9)
            ax.text(bar2.get_x() + bar2.get_width()/2., height2,
                    f'${int(n_type[i])}',
                    ha='center', va='bottom', fontsize=9)
    
    ax.set_xlabel('Características Técnicas', fontsize=12, fontweight='bold')
    ax.set_ylabel('Valor (ver unidades en categorías)', fontsize=12, fontweight='bold')
    ax.set_title('Comparación de Tecnologías Fotovoltaicas\nPERC vs N-Type TOPCon',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(categorias, fontsize=10)
    ax.legend(fontsize=11)
    ax.grid(axis='y', alpha=0.3)
    
    # Nota al pie
    fig.text(0.5, 0.02, 'Nota: Para "Costo", valores en ×100 COP/Wp para escala visual',
             ha='center', fontsize=9, style='italic', color='gray')
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / '03_comparativa_tecnologias.png', dpi=300, bbox_inches='tight')
    plt.savefig(OUTPUT_DIR / '03_comparativa_tecnologias.svg', format='svg', bbox_inches='tight')
    print("✓ Gráfico 3 generado: Comparativa de tecnologías")
    plt.close()


def grafico_4_incentivos_fiscales():
    """
    Cascada de incentivos fiscales (Waterfall chart)
    """
    # Sistema residencial 5 kWp
    costos = {
        'Costo Base': 19_900_000,
        'Exclusión IVA': -2_641_000,
        'Deducción Renta': -3_482_500,
        'Depreciación Acelerada': -1_393_000,
        'Costo Final': 12_383_500
    }
    
    categorias = list(costos.keys())
    valores = list(costos.values())
    
    # Calcular posiciones para cascada
    cumsum = [0]
    for i, val in enumerate(valores[:-1]):
        if val < 0:
            cumsum.append(cumsum[-1] + val)
        else:
            cumsum.append(val)
    
    cumsum.append(valores[-1])
    
    fig, ax = plt.subplots(figsize=(14, 8))
    
    colors = ['#4ECDC4', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#95E1D3']
    
    # Dibujar barras
    for i in range(len(categorias)-1):
        if valores[i] > 0:
            ax.bar(i, valores[i], bottom=0, color=colors[i], 
                   edgecolor='black', linewidth=1.5)
            ax.text(i, valores[i]/2, f'${valores[i]:,.0f}',
                    ha='center', va='center', fontsize=10, fontweight='bold')
        else:
            start = cumsum[i]
            ax.bar(i, abs(valores[i]), bottom=start+valores[i], 
                   color=colors[i], edgecolor='black', linewidth=1.5)
            ax.text(i, start + valores[i]/2, f'-${abs(valores[i]):,.0f}',
                    ha='center', va='center', fontsize=10, fontweight='bold', color='white')
    
    # Barra final
    ax.bar(len(categorias)-1, valores[-1], bottom=0, 
           color=colors[-1], edgecolor='black', linewidth=1.5)
    ax.text(len(categorias)-1, valores[-1]/2, f'${valores[-1]:,.0f}',
            ha='center', va='center', fontsize=10, fontweight='bold')
    
    ax.set_xticks(range(len(categorias)))
    ax.set_xticklabels(categorias, fontsize=11, rotation=15, ha='right')
    ax.set_ylabel('Costo (COP)', fontsize=12, fontweight='bold')
    ax.set_title('Impacto de Incentivos Fiscales en Sistema Solar 5 kWp\n(Ley 1715 de 2014)',
                 fontsize=14, fontweight='bold', pad=20)
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x/1e6:.1f}M'))
    ax.grid(axis='y', alpha=0.3)
    
    # Anotación de ahorro total
    ahorro_total = abs(sum([v for v in valores[1:-1]]))
    ax.annotate(f'Ahorro Total: ${ahorro_total:,.0f}\n(37.8% del costo base)',
                xy=(2, 15_000_000), fontsize=12, fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.8', facecolor='yellow', alpha=0.7),
                ha='center')
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / '04_incentivos_fiscales_waterfall.png', dpi=300, bbox_inches='tight')
    plt.savefig(OUTPUT_DIR / '04_incentivos_fiscales_waterfall.svg', format='svg', bbox_inches='tight')
    print("✓ Gráfico 4 generado: Incentivos fiscales (waterfall)")
    plt.close()


def grafico_5_modelos_negocio():
    """
    Comparación de modelos de negocio (ROI, Inversión, Complejidad)
    """
    modelos = ['EPC', 'PPA', 'Off-Grid\n(ZNI)', 'ESCO', 'Autoconsumo\nFinanciado']
    roi_años = [2.5, 7.5, 5.5, 9.0, 4.5]
    inversion_millones = [250, 1200, 450, 1200, 400]  # Millones COP
    complejidad = [2, 4, 3, 5, 3]  # Escala 1-5
    impacto_social = [3, 3, 5, 4, 3]  # Escala 1-5
    
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
    
    # Gráfico 1: ROI
    colors_roi = ['#95E1D3' if x < 5 else '#FF6B6B' if x > 7 else '#FFD93D' for x in roi_años]
    bars1 = ax1.barh(modelos, roi_años, color=colors_roi, edgecolor='black', linewidth=1.5)
    for i, (bar, valor) in enumerate(zip(bars1, roi_años)):
        ax1.text(valor + 0.2, i, f'{valor} años', va='center', fontsize=10, fontweight='bold')
    ax1.set_xlabel('Tiempo de Retorno (años)', fontsize=11, fontweight='bold')
    ax1.set_title('Retorno de Inversión (ROI) por Modelo', fontsize=12, fontweight='bold')
    ax1.axvline(x=5, color='green', linestyle='--', linewidth=2, alpha=0.5, label='Objetivo < 5 años')
    ax1.legend()
    ax1.grid(axis='x', alpha=0.3)
    
    # Gráfico 2: Inversión Inicial
    colors_inv = ['#4ECDC4' if x < 500 else '#FFA07A' for x in inversion_millones]
    bars2 = ax2.barh(modelos, inversion_millones, color=colors_inv, edgecolor='black', linewidth=1.5)
    for i, (bar, valor) in enumerate(zip(bars2, inversion_millones)):
        ax2.text(valor + 30, i, f'${valor}M', va='center', fontsize=10, fontweight='bold')
    ax2.set_xlabel('Inversión Inicial (Millones COP)', fontsize=11, fontweight='bold')
    ax2.set_title('Capital Requerido por Modelo', fontsize=12, fontweight='bold')
    ax2.grid(axis='x', alpha=0.3)
    
    # Gráfico 3: Complejidad
    colors_comp = ['#95E1D3' if x <= 2 else '#FFD93D' if x == 3 else '#FF6B6B' for x in complejidad]
    bars3 = ax3.barh(modelos, complejidad, color=colors_comp, edgecolor='black', linewidth=1.5)
    ax3.set_xlabel('Nivel de Complejidad (1-5)', fontsize=11, fontweight='bold')
    ax3.set_title('Complejidad de Implementación', fontsize=12, fontweight='bold')
    ax3.set_xlim(0, 6)
    ax3.grid(axis='x', alpha=0.3)
    
    # Gráfico 4: Impacto Social
    colors_social = ['#FFD93D' if x == 3 else '#4ECDC4' if x == 4 else '#95E1D3' for x in impacto_social]
    bars4 = ax4.barh(modelos, impacto_social, color=colors_social, edgecolor='black', linewidth=1.5)
    ax4.set_xlabel('Impacto Social (1-5)', fontsize=11, fontweight='bold')
    ax4.set_title('Impacto Social y Comunitario', fontsize=12, fontweight='bold')
    ax4.set_xlim(0, 6)
    ax4.grid(axis='x', alpha=0.3)
    
    plt.suptitle('Análisis Comparativo de Modelos de Negocio\nEmpresa de Energía Solar - Caquetá',
                 fontsize=16, fontweight='bold', y=0.995)
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / '05_modelos_negocio_comparativo.png', dpi=300, bbox_inches='tight')
    plt.savefig(OUTPUT_DIR / '05_modelos_negocio_comparativo.svg', format='svg', bbox_inches='tight')
    print("✓ Gráfico 5 generado: Modelos de negocio comparativo")
    plt.close()


def grafico_6_proyeccion_financiera():
    """
    Proyección financiera a 5 años (ingresos, EBITDA, ROI acumulado)
    """
    años = ['Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5']
    ingresos_millones = [396, 710, 980, 1250, 1680]
    ebitda_millones = [85, 180, 290, 410, 580]
    roi_acumulado = [-65, -15, 35, 85, 145]
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
    
    # Gráfico 1: Ingresos y EBITDA
    x = np.arange(len(años))
    width = 0.35
    
    bars1 = ax1.bar(x - width/2, ingresos_millones, width, label='Ingresos',
                    color='#4ECDC4', edgecolor='black', linewidth=1.5)
    bars2 = ax1.bar(x + width/2, ebitda_millones, width, label='EBITDA',
                    color='#95E1D3', edgecolor='black', linewidth=1.5)
    
    # Añadir valores
    for bars in [bars1, bars2]:
        for bar in bars:
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height,
                    f'${int(height)}M',
                    ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    ax1.set_xlabel('Período', fontsize=12, fontweight='bold')
    ax1.set_ylabel('Millones COP', fontsize=12, fontweight='bold')
    ax1.set_title('Proyección de Ingresos y EBITDA (5 años)\nEstrategia Híbrida: EPC + Off-Grid + PPA',
                  fontsize=13, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(años, fontsize=11)
    ax1.legend(fontsize=11)
    ax1.grid(axis='y', alpha=0.3)
    
    # Gráfico 2: ROI Acumulado
    colors_roi = ['#FF6B6B' if v < 0 else '#95E1D3' for v in roi_acumulado]
    bars3 = ax2.bar(años, roi_acumulado, color=colors_roi, edgecolor='black', linewidth=1.5)
    
    for bar, valor in zip(bars3, roi_acumulado):
        height = bar.get_height()
        y_pos = height + 5 if height > 0 else height - 10
        ax2.text(bar.get_x() + bar.get_width()/2., y_pos,
                f'{valor:+d}%',
                ha='center', va='bottom' if height > 0 else 'top',
                fontsize=11, fontweight='bold')
    
    ax2.axhline(y=0, color='black', linewidth=2)
    ax2.set_xlabel('Período', fontsize=12, fontweight='bold')
    ax2.set_ylabel('ROI Acumulado (%)', fontsize=12, fontweight='bold')
    ax2.set_title('Retorno de Inversión Acumulado\n(Break-even en Año 3)',
                  fontsize=13, fontweight='bold')
    ax2.grid(axis='y', alpha=0.3)
    
    # Anotación de break-even
    ax2.annotate('Break-even alcanzado',
                xy=(2, 35), xytext=(2.5, 80),
                arrowprops=dict(arrowstyle='->', lw=2, color='green'),
                fontsize=11, fontweight='bold', color='green',
                bbox=dict(boxstyle='round,pad=0.5', facecolor='lightgreen', alpha=0.7))
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / '06_proyeccion_financiera_5_años.png', dpi=300, bbox_inches='tight')
    plt.savefig(OUTPUT_DIR / '06_proyeccion_financiera_5_años.svg', format='svg', bbox_inches='tight')
    print("✓ Gráfico 6 generado: Proyección financiera 5 años")
    plt.close()


def grafico_7_mapa_calor_oportunidades():
    """
    Mapa de calor: Segmentación de mercado en el Caquetá
    """
    segmentos = ['Residencial\nUrbano', 'Comercial/\nIndustrial', 'Rural\nInterconectado',
                 'Zonas No\nInterconectadas', 'Sector\nPúblico']
    
    criterios = ['Tamaño\nMercado', 'Accesibilidad', 'Capacidad\nde Pago', 
                 'Incentivos\nDisponibles', 'Competencia']
    
    # Matriz de puntuación (1-5)
    data = np.array([
        [5, 5, 4, 3, 3],  # Residencial Urbano
        [3, 4, 5, 3, 2],  # Comercial/Industrial
        [4, 3, 3, 3, 2],  # Rural Interconectado
        [5, 2, 2, 5, 1],  # ZNI (máxima oportunidad)
        [2, 4, 4, 4, 1],  # Sector Público
    ])
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    im = ax.imshow(data, cmap='RdYlGn', aspect='auto', vmin=1, vmax=5)
    
    # Configurar ticks
    ax.set_xticks(np.arange(len(criterios)))
    ax.set_yticks(np.arange(len(segmentos)))
    ax.set_xticklabels(criterios, fontsize=11)
    ax.set_yticklabels(segmentos, fontsize=11)
    
    # Rotar etiquetas del eje x
    plt.setp(ax.get_xticklabels(), rotation=0, ha="center")
    
    # Añadir valores en cada celda
    for i in range(len(segmentos)):
        for j in range(len(criterios)):
            text = ax.text(j, i, data[i, j],
                          ha="center", va="center", color="black",
                          fontsize=14, fontweight='bold')
    
    ax.set_title('Matriz de Oportunidades de Mercado - Caquetá\nAnálisis de Segmentación (1=Bajo, 5=Alto)',
                 fontsize=14, fontweight='bold', pad=20)
    
    # Barra de color
    cbar = plt.colorbar(im, ax=ax, orientation='vertical', pad=0.02)
    cbar.set_label('Puntuación de Oportunidad', rotation=270, labelpad=25, fontsize=11, fontweight='bold')
    
    # Resaltar ZNI
    rect = mpatches.Rectangle((-.5, 3-.5), 5, 1, fill=False, edgecolor='blue', linewidth=3)
    ax.add_patch(rect)
    ax.text(5.5, 3, 'MÁXIMA\nOPORTUNIDAD', fontsize=10, fontweight='bold',
            color='blue', va='center', bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.7))
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / '07_mapa_calor_oportunidades.png', dpi=300, bbox_inches='tight')
    plt.savefig(OUTPUT_DIR / '07_mapa_calor_oportunidades.svg', format='svg', bbox_inches='tight')
    print("✓ Gráfico 7 generado: Mapa de calor de oportunidades")
    plt.close()


def grafico_8_comparativa_precios_paneles():
    """
    Comparación de precios y características de paneles solares recomendados
    """
    modelos = ['JA Solar\n545W PERC', 'Longi\n535W PERC', 'Trina\n585W N-Type', 
               'Canadian\n620W Bifacial']
    potencia = [545, 535, 585, 620]
    eficiencia = [21.1, 21.0, 22.5, 22.8]
    precio_miles = [885, 840, 1250, 1350]  # Miles COP
    garantia = [25, 25, 30, 30]
    
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
    
    # Gráfico 1: Precio
    colors = ['#4ECDC4', '#4ECDC4', '#FF6B6B', '#FF6B6B']
    bars1 = ax1.bar(modelos, precio_miles, color=colors, edgecolor='black', linewidth=1.5)
    for bar, precio in zip(bars1, precio_miles):
        ax1.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 30,
                f'${precio}K',
                ha='center', va='bottom', fontsize=11, fontweight='bold')
    ax1.set_ylabel('Precio (Miles COP)', fontsize=11, fontweight='bold')
    ax1.set_title('Precio por Panel', fontsize=12, fontweight='bold')
    ax1.grid(axis='y', alpha=0.3)
    
    # Gráfico 2: Eficiencia
    bars2 = ax2.bar(modelos, eficiencia, color=colors, edgecolor='black', linewidth=1.5)
    for bar, ef in zip(bars2, eficiencia):
        ax2.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.2,
                f'{ef}%',
                ha='center', va='bottom', fontsize=11, fontweight='bold')
    ax2.set_ylabel('Eficiencia (%)', fontsize=11, fontweight='bold')
    ax2.set_title('Eficiencia de Conversión', fontsize=12, fontweight='bold')
    ax2.axhline(y=21, color='orange', linestyle='--', linewidth=2, alpha=0.5, label='Estándar industria')
    ax2.legend()
    ax2.grid(axis='y', alpha=0.3)
    
    # Gráfico 3: Potencia
    bars3 = ax3.bar(modelos, potencia, color=colors, edgecolor='black', linewidth=1.5)
    for bar, pot in zip(bars3, potencia):
        ax3.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 10,
                f'{pot}W',
                ha='center', va='bottom', fontsize=11, fontweight='bold')
    ax3.set_ylabel('Potencia Nominal (W)', fontsize=11, fontweight='bold')
    ax3.set_title('Capacidad de Generación', fontsize=12, fontweight='bold')
    ax3.grid(axis='y', alpha=0.3)
    
    # Gráfico 4: Costo-Efectividad (COP/Wp)
    costo_wp = [p*1000/pot for p, pot in zip(precio_miles, potencia)]
    bars4 = ax4.bar(modelos, costo_wp, color=colors, edgecolor='black', linewidth=1.5)
    for bar, costo in zip(bars4, costo_wp):
        ax4.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 30,
                f'${costo:.0f}/Wp',
                ha='center', va='bottom', fontsize=11, fontweight='bold')
    ax4.set_ylabel('Costo por Vatio (COP/Wp)', fontsize=11, fontweight='bold')
    ax4.set_title('Análisis de Costo-Efectividad', fontsize=12, fontweight='bold')
    ax4.grid(axis='y', alpha=0.3)
    
    plt.suptitle('Comparativa de Paneles Solares Recomendados para Caquetá\n(Gama Media-Alta y Alta)',
                 fontsize=16, fontweight='bold', y=0.995)
    
    # Leyenda de tecnología
    legend_elements = [
        mpatches.Patch(facecolor='#4ECDC4', edgecolor='black', label='Gama Media-Alta (PERC)'),
        mpatches.Patch(facecolor='#FF6B6B', edgecolor='black', label='Gama Alta (N-Type)')
    ]
    fig.legend(handles=legend_elements, loc='lower center', ncol=2, fontsize=11,
              bbox_to_anchor=(0.5, -0.02))
    
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / '08_comparativa_precios_paneles.png', dpi=300, bbox_inches='tight')
    plt.savefig(OUTPUT_DIR / '08_comparativa_precios_paneles.svg', format='svg', bbox_inches='tight')
    print("✓ Gráfico 8 generado: Comparativa de paneles solares")
    plt.close()


def generar_todos_los_graficos():
    """
    Genera todos los gráficos del estudio
    """
    print("\n" + "="*60)
    print("GENERANDO GRÁFICOS DEL ESTUDIO DE PRE-FACTIBILIDAD")
    print("Empresa de Energía Solar - Caquetá")
    print("="*60 + "\n")
    
    grafico_1_radiacion_solar_colombia()
    grafico_2_factores_climaticos_caqueta()
    grafico_3_comparativa_tecnologias()
    grafico_4_incentivos_fiscales()
    grafico_5_modelos_negocio()
    grafico_6_proyeccion_financiera()
    grafico_7_mapa_calor_oportunidades()
    grafico_8_comparativa_precios_paneles()
    
    print("\n" + "="*60)
    print(f"✓ TODOS LOS GRÁFICOS GENERADOS EXITOSAMENTE")
    print(f"✓ Ubicación: {OUTPUT_DIR.absolute()}")
    print(f"✓ Formatos: PNG (alta resolución) y SVG (vectorial)")
    print("="*60 + "\n")


if __name__ == "__main__":
    generar_todos_los_graficos()
