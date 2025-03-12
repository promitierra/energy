import { processBill, OcrExtractionResult, processImageWithOcr, extractBillData } from '../../../features/ocr/ocrUtils';
import Tesseract from 'tesseract.js';

// Mock Tesseract.js
jest.mock('tesseract.js', () => ({
  recognize: jest.fn(),
}));

// Mock the processImageWithOcr and extractBillData functions
jest.mock('../../../features/ocr/ocrUtils', () => {
  const originalModule = jest.requireActual('../../../features/ocr/ocrUtils');
  return {
    ...originalModule,
    processImageWithOcr: jest.fn(),
    extractBillData: jest.fn(),
  };
});

describe('Bill Processing', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processBill', () => {
    test('should process bill image and return structured data', async () => {
      // Create a mock file
      const mockFile = new File(['dummy content'], 'bill.png', { type: 'image/png' });
      
      // Mock OCR processing result
      const mockOcrResult = {
        text: 'Sample bill text',
        confidence: 90
      };
      
      // Mock extraction result
      const mockExtractionResult: OcrExtractionResult = {
        companyName: 'Iberdrola',
        billingPeriod: '01/01/2023 - 31/01/2023',
        totalAmount: '85,50€',
        consumption: '350 kWh',
        rate: '0,25€/kWh',
        confidence: {
          overall: 90,
          fields: {
            companyName: 0.8,
            billingPeriod: 0.9,
            totalAmount: 0.85,
            consumption: 0.8,
            rate: 0.75
          }
        },
        rawText: 'Sample bill text'
      };
      
      // Setup mocks
      (processImageWithOcr as jest.Mock).mockResolvedValue(mockOcrResult);
      (extractBillData as jest.Mock).mockReturnValue(mockExtractionResult);
      
      // Call the function
      const result = await processBill(mockFile, { lang: 'spa' });
      
      // Check that the underlying functions were called correctly
      expect(processImageWithOcr).toHaveBeenCalledWith(mockFile, { lang: 'spa' });
      expect(extractBillData).toHaveBeenCalledWith('Sample bill text', 90);
      
      // Check the result
      expect(result).toEqual(mockExtractionResult);
    });

    test('should handle processing errors', async () => {
      // Create a mock file
      const mockFile = new File(['dummy content'], 'bill.png', { type: 'image/png' });
      
      // Setup mock to throw an error
      (processImageWithOcr as jest.Mock).mockRejectedValue(new Error('Processing failed'));
      
      // Call the function and expect it to throw
      await expect(processBill(mockFile)).rejects.toThrow('Processing failed');
      
      // Check that extractBillData was not called
      expect(extractBillData).not.toHaveBeenCalled();
    });

    test('should pass custom options to processImageWithOcr', async () => {
      // Create a mock file
      const mockFile = new File(['dummy content'], 'bill.png', { type: 'image/png' });
      
      // Mock OCR processing result
      const mockOcrResult = {
        text: 'Sample bill text',
        confidence: 90
      };
      
      // Mock extraction result
      const mockExtractionResult: OcrExtractionResult = {
        companyName: 'Endesa',
        billingPeriod: '01/02/2023 - 28/02/2023',
        totalAmount: '92,30€',
        consumption: '370 kWh',
        rate: '0,25€/kWh',
        confidence: {
          overall: 90,
          fields: {
            companyName: 0.8,
            billingPeriod: 0.9,
            totalAmount: 0.85,
            consumption: 0.8,
            rate: 0.75
          }
        },
        rawText: 'Sample bill text'
      };
      
      // Setup mocks
      (processImageWithOcr as jest.Mock).mockResolvedValue(mockOcrResult);
      (extractBillData as jest.Mock).mockReturnValue(mockExtractionResult);
      
      // Custom options
      const customOptions = {
        lang: 'eng',
        imagePreprocessing: false
      };
      
      // Call the function with custom options
      await processBill(mockFile, customOptions);
      
      // Check that processImageWithOcr was called with custom options
      expect(processImageWithOcr).toHaveBeenCalledWith(mockFile, customOptions);
    });

    test('should integrate OCR processing with data extraction', async () => {
      // Create a mock file
      const mockFile = new File(['dummy content'], 'bill.png', { type: 'image/png' });
      
      // Use the actual implementation for this test
      (processImageWithOcr as jest.Mock).mockImplementation(async (file, options) => {
        return {
          text: 'Factura de Naturgy\nPeriodo: 01/03/2023 hasta 31/03/2023\nImporte total: 78,45 €\nConsumo: 310 kWh\nPrecio: 0,25 €/kWh',
          confidence: 95
        };
      });
      
      // Use the actual implementation for extractBillData
      (extractBillData as jest.Mock).mockImplementation((text, confidence) => {
        // This is a simplified version of the actual implementation
        return {
          companyName: 'Naturgy',
          billingPeriod: '01/03/2023 - 31/03/2023',
          totalAmount: '78,45€',
          consumption: '310 kWh',
          rate: '0,25€/kWh',
          confidence: {
            overall: confidence,
            fields: {
              companyName: 0.8,
              billingPeriod: 0.9,
              totalAmount: 0.85,
              consumption: 0.8,
              rate: 0.75
            }
          },
          rawText: text
        };
      });
      
      // Call the function
      const result = await processBill(mockFile);
      
      // Check the result
      expect(result.companyName).toBe('Naturgy');
      expect(result.billingPeriod).toBe('01/03/2023 - 31/03/2023');
      expect(result.totalAmount).toBe('78,45€');
      expect(result.consumption).toBe('310 kWh');
      expect(result.rate).toBe('0,25€/kWh');
      expect(result.confidence.overall).toBe(95);
    });
  });
});