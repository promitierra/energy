/**
 * Utilidades para compresión y descompresión de datos
 * Optimiza la transferencia de datos para gráficos grandes
 */

// Comprime datos de gráficos utilizando simplificación y minimización de claves
export function compressChartData<T extends Record<string, any>>(data: T[]): string {
  if (!data || !data.length) return '';
  
  // Extraer todas las claves (columnas)
  const keys = Object.keys(data[0]);
  
  // Datos simplificados: solo valores, sin claves
  const rows = data.map(item => keys.map(key => item[key]));
  
  // Crear estructura comprimida
  const compressed = {
    k: keys,         // k: claves (nombres de columna)
    r: rows          // r: filas de datos
  };
  
  return JSON.stringify(compressed);
}

// Descomprime datos previamente comprimidos
export function decompressChartData(compressedStr: string): any[] {
  if (!compressedStr) return [];
  
  try {
    const compressed = JSON.parse(compressedStr);
    
    // Validar estructura
    if (!compressed.k || !compressed.r || !Array.isArray(compressed.k) || !Array.isArray(compressed.r)) {
      console.error('Formato de datos comprimidos inválido');
      return [];
    }
    
    // Reconstruir el objeto original
    return compressed.r.map((row: any[]) => {
      const obj: Record<string, any> = {};
      compressed.k.forEach((key: string, index: number) => {
        obj[key] = row[index];
      });
      return obj;
    });
    
  } catch (error) {
    console.error('Error al descomprimir datos:', error);
    return [];
  }
}

// Utilidad para simplificar datos de gráficos con muchos puntos
export function simplifyDataPoints<T extends Record<string, any>>(
  data: T[], 
  maxPoints: number = 100,
  xKey: string = 'x'
): T[] {
  if (!data || data.length <= maxPoints) return data;
  
  // Calcular factor de reducción
  const factor = Math.ceil(data.length / maxPoints);
  
  // Simplificar tomando puntos a intervalos regulares
  return data.filter((_, index) => index % factor === 0);
}

// Agrupar datos para reducir puntos en gráficos grandes (promedio)
export function aggregateDataPoints<T extends Record<string, any>>(
  data: T[], 
  numGroups: number = 20,
  valueKeys: string[] = []
): any[] {
  if (!data || !data.length || numGroups >= data.length) return data;
  
  // Si no se especifican claves de valor, identificar automáticamente las propiedades numéricas
  const keysToAggregate = valueKeys.length > 0 ? 
    valueKeys : 
    Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
  
  // Tamaño de cada grupo
  const groupSize = Math.ceil(data.length / numGroups);
  const result = [];
  
  // Agrupar y calcular promedios
  for (let i = 0; i < data.length; i += groupSize) {
    const group = data.slice(i, i + groupSize);
    
    if (group.length === 0) continue;
    
    // Crear objeto base para el grupo (conservar propiedades no numéricas del primer elemento)
    const aggregated: Record<string, any> = {...group[0]};
    
    // Calcular promedios solo para las claves numéricas identificadas
    keysToAggregate.forEach(key => {
      // Verificar si todas las entradas en el grupo tienen valores numéricos para esta clave
      const allNumeric = group.every(item => typeof item[key] === 'number');
      
      if (allNumeric) {
        const sum = group.reduce((acc, item) => acc + (item[key] as number), 0);
        aggregated[key] = sum / group.length;
      }
      // Si no son todos numéricos, mantener el valor del primer elemento (ya copiado)
    });
    
    result.push(aggregated);
  }
  
  return result;
}