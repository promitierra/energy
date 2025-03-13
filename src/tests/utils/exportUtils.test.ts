import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { exportValidationToExcel, exportOcrResultsToExcel } from '../../utils/exportUtils';
import { ValidationComparison } from '../../features/validation/types';
import { OcrExtractionResult } from '../../features/ocr/ocrUtils';

// Mock dependencies
jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn().mockReturnValue({}),
    aoa_to_sheet: jest.fn().mockReturnValue({}),
    book_append_sheet: jest.fn()
  },
  write: jest.fn().mockReturnValue(new Blob())
}));

jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

describe('Export Utilities', () => {
  // Sample validation data for testing
  const sampleValidationData: ValidationComparison = {
    installationId: 'test-123',
    period: {
      start: '2023-01-01',
      end: '2023-01-31'
    },
    metrics: {
      totalConsumption: {
        predicted: 450,
        actual: 420,
        deviation: 7.14
      },
      totalProduction: {
        predicted: 300,
        actual: 320,
        deviation: -6.25
      },
      selfConsumption: {
        predicted: 200,
        actual: 210,
        deviation: -4.76
      }
    },
    dailyComparisons: [
      {
        date: '2023-01-15',
        consumption: { predicted: 15, actual: 14, deviation: 7.14 },
        production: { predicted: 10, actual: 11, deviation: -9.09 }
      }
    ],
    anomalies: [
      {
        date: '2023-01-20',
        metric: 'consumption',
        predicted: 15,
        actual: 25,
        deviation: -40,
        severity: 'high'
      }
    ]
  };

  // Sample OCR data for testing
  const sampleOcrResults: OcrExtractionResult = {
    companyName: 'Empresa Energética Test',
    billingPeriod: '01/01/2023 - 31/01/2023',
    totalAmount: '150000',
    consumption: '250',
    rate: '600',
    confidence: {
      overall: 85,
      fields: {
        companyName: 90,
        billingPeriod: 85,
        totalAmount: 88,
        consumption: 92,
        rate: 80
      }
    },
    rawText: 'Sample raw text from OCR extraction'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportValidationToExcel', () => {
    test('creates a workbook with validation data', () => {
      // Call the export function
      exportValidationToExcel(sampleValidationData, 'test-validation-export');
      
      // Check if XLSX functions were called correctly
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalledTimes(2); // Summary and details sheets
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(2);
      expect(XLSX.write).toHaveBeenCalledWith(expect.anything(), { bookType: 'xlsx', type: 'array' });
      
      // Check if file was saved
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'test-validation-export.xlsx'
      );
    });

    test('includes anomalies in the export if present', () => {
      // Call the export function
      exportValidationToExcel(sampleValidationData, 'test-validation-export');
      
      // The second call to aoa_to_sheet should include anomaly data
      const secondCallArgs = (XLSX.utils.aoa_to_sheet as jest.Mock).mock.calls[1][0];
      
      // Check if anomaly data is included
      expect(secondCallArgs).toContainEqual(
        expect.arrayContaining(['2023-01-20'])
      );
    });

    test('handles validation data without anomalies', () => {
      // Create a copy of sample data without anomalies
      const dataWithoutAnomalies = { ...sampleValidationData, anomalies: [] };
      
      // Call the export function
      exportValidationToExcel(dataWithoutAnomalies, 'test-validation-export');
      
      // Should still create workbook and sheets
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalledTimes(2);
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(2);
    });
  });

  describe('exportOcrResultsToExcel', () => {
    test('creates a workbook with OCR extraction data', () => {
      // Call the export function
      exportOcrResultsToExcel(sampleOcrResults, 'test-ocr-export');
      
      // Check if XLSX functions were called correctly
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalledTimes(1);
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(1);
      
      // Check if file was saved
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'test-ocr-export.xlsx'
      );
    });

    test('includes confidence scores in the export', () => {
      // Call the export function
      exportOcrResultsToExcel(sampleOcrResults, 'test-ocr-export');
      
      // The call to aoa_to_sheet should include confidence data
      const callArgs = (XLSX.utils.aoa_to_sheet as jest.Mock).mock.calls[0][0];
      
      // Check if confidence data is included
      expect(callArgs).toContainEqual(
        expect.arrayContaining(['Confianza General', '85%'])
      );
    });
  });
});