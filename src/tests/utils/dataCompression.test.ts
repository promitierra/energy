import { 
  compressChartData, 
  decompressChartData, 
  simplifyDataPoints,
  aggregateDataPoints
} from '../../utils/dataCompression';

describe('Data Compression Utilities', () => {
  // Datos de prueba
  const testData = [
    { year: '2020', value1: 100, value2: 200 },
    { year: '2021', value1: 150, value2: 250 },
    { year: '2022', value1: 200, value2: 300 }
  ];

  describe('compressChartData', () => {
    it('debería comprimir datos correctamente', () => {
      const compressed = compressChartData(testData);
      expect(typeof compressed).toBe('string');
      
      // Verificar estructura
      const parsed = JSON.parse(compressed);
      expect(parsed).toHaveProperty('k');
      expect(parsed).toHaveProperty('r');
      
      // Verificar claves
      expect(parsed.k).toEqual(['year', 'value1', 'value2']);
      
      // Verificar filas de datos
      expect(parsed.r).toHaveLength(3);
      expect(parsed.r[0]).toEqual(['2020', 100, 200]);
    });

    it('debería devolver una cadena vacía para datos vacíos', () => {
      expect(compressChartData([])).toBe('');
    });
  });

  describe('decompressChartData', () => {
    it('debería descomprimir datos correctamente', () => {
      const compressed = compressChartData(testData);
      const decompressed = decompressChartData(compressed);
      
      expect(decompressed).toEqual(testData);
    });

    it('debería devolver un array vacío para entrada inválida', () => {
      expect(decompressChartData('')).toEqual([]);
      expect(decompressChartData('{"invalid": "format"}')).toEqual([]);
    });
  });

  describe('simplifyDataPoints', () => {
    it('debería reducir puntos según el máximo especificado', () => {
      const largeDataset = Array.from({ length: 500 }, (_, i) => ({
        x: i,
        value: Math.random() * 100
      }));
      
      const simplified = simplifyDataPoints(largeDataset, 50);
      expect(simplified.length).toBeLessThanOrEqual(50);
    });

    it('debería devolver el conjunto original si es menor que maxPoints', () => {
      const simplified = simplifyDataPoints(testData, 10);
      expect(simplified).toEqual(testData);
    });
  });

  describe('aggregateDataPoints', () => {
    it('debería agregar datos correctamente en grupos', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        x: i,
        value1: 100,
        value2: 200
      }));
      
      const aggregated = aggregateDataPoints(largeDataset, 10, ['value1', 'value2']);
      
      expect(aggregated.length).toBeLessThanOrEqual(10);
      
      // Verificar que los promedios se calculan correctamente
      expect(aggregated[0].value1).toBeCloseTo(100);
      expect(aggregated[0].value2).toBeCloseTo(200);
    });

    it('debería mantener el dataset original si es menor que el número de grupos', () => {
      // Crear datos numéricos para la prueba
      const numericTestData = [
        { year: 2020, value1: 100, value2: 200 },
        { year: 2021, value1: 150, value2: 250 },
        { year: 2022, value1: 200, value2: 300 }
      ];
      
      const aggregated = aggregateDataPoints(numericTestData, 10);
      expect(aggregated).toEqual(numericTestData);
    });
  });
});