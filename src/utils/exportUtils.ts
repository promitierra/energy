import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ValidationComparison, InstallationData, ReadingData } from '../features/validation/types';
import { OcrExtractionResult } from '../features/ocr/ocrUtils';

// Configure locale for Colombian number formatting
const colombianLocale = {
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['$', ''],
  dateTime: '%a %b %e %X %Y',
  date: '%d/%m/%Y',
  time: '%H:%M:%S'
};

/**
 * Utility functions for exporting data to standard formats
 */

/**
 * Export validation comparison data to Excel format
 * @param data The validation comparison data to export
 * @param filename The name of the exported file (without extension)
 */
export const exportValidationToExcel = (data: ValidationComparison, filename: string = 'validation-report'): void => {
  try {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Create summary sheet
    const summaryData = [
      ['Informe de Validación'],
      ['ID de Instalación', data.installationId],
      ['Periodo', `${data.period.start} a ${data.period.end}`],
      [''],
      ['Métricas', 'Predicción', 'Real', 'Desviación (%)'],
      ['Consumo Total', String(data.metrics.totalConsumption.predicted), String(data.metrics.totalConsumption.actual), String(data.metrics.totalConsumption.deviation)],
    ];
    
    // Add production data if available
    if (data.metrics.totalProduction) {
      summaryData.push([
        'Producción Total',
        String(data.metrics.totalProduction.predicted),
        String(data.metrics.totalProduction.actual),
        String(data.metrics.totalProduction.deviation)
      ]);
    }
    
    // Add self-consumption data if available
    if (data.metrics.selfConsumption) {
      summaryData.push([
        'Autoconsumo',
        String(data.metrics.selfConsumption.predicted),
        String(data.metrics.selfConsumption.actual),
        String(data.metrics.selfConsumption.deviation)
      ]);
    }
    
    // Add cost savings data if available
    if (data.metrics.costSavings) {
      summaryData.push([
        'Ahorro de Costes',
        String(data.metrics.costSavings.predicted),
        String(data.metrics.costSavings.actual),
        String(data.metrics.costSavings.deviation)
      ]);
    }
    
    // Create summary worksheet
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');
    
    // Create detailed comparison sheet if hourly data is available
    if (data.hourlyComparison && data.hourlyComparison.length > 0) {
      const detailedData = [
        ['Timestamp', 'Consumo Predicho', 'Consumo Real', 'Producción Predicha', 'Producción Real']
      ];
      
      data.hourlyComparison.forEach(hour => {
        const row = [
          hour.timestamp,
          String(hour.consumption.predicted),
          String(hour.consumption.actual),
          hour.production?.predicted !== undefined ? String(hour.production.predicted) : '',
          hour.production?.actual !== undefined ? String(hour.production.actual) : ''
        ];
        detailedData.push(row);
      });
      
      const detailedWs = XLSX.utils.aoa_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(wb, detailedWs, 'Datos Detallados');
    }
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file
    saveAs(blob, `${filename}.xlsx`);
    
    console.log('Validation data exported successfully to Excel');
  } catch (error) {
    console.error('Error exporting validation data to Excel:', error);
    throw new Error('Failed to export validation data to Excel');
  }
};

/**
 * Export OCR extraction results to Excel format
 * @param data The OCR extraction results to export
 * @param filename The name of the exported file (without extension)
 */
export const exportOcrResultsToExcel = (data: OcrExtractionResult, filename: string = 'ocr-results'): void => {
  try {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Create data array
    const ocrData = [
      ['Resultados de Extracción OCR'],
      [''],
      ['Campo', 'Valor', 'Confianza (%)'],
      ['Compañía', data.companyName, String(data.confidence.fields.companyName || data.confidence.overall) + '%'],
      ['Periodo de Facturación', data.billingPeriod, String(data.confidence.fields.billingPeriod || data.confidence.overall) + '%'],
      ['Importe Total', data.totalAmount, String(data.confidence.fields.totalAmount || data.confidence.overall) + '%'],
      ['Consumo', data.consumption, String(data.confidence.fields.consumption || data.confidence.overall) + '%'],
      ['Tarifa', data.rate, String(data.confidence.fields.rate || data.confidence.overall) + '%'],
      [''],
      ['Confianza General', String(data.confidence.overall) + '%', ''],
      [''],
      ['Texto Extraído'],
      [data.rawText]
    ];
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(ocrData);
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados OCR');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file
    saveAs(blob, `${filename}.xlsx`);
    
    console.log('OCR results exported successfully to Excel');
  } catch (error) {
    console.error('Error exporting OCR results to Excel:', error);
    throw new Error('Failed to export OCR results to Excel');
  }
};