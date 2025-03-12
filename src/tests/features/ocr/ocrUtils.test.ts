import { preprocessImage, processImageWithOcr, extractBillData } from '../../../features/ocr/ocrUtils';
import Tesseract from 'tesseract.js';

// Mock Tesseract.js
jest.mock('tesseract.js', () => ({
  recognize: jest.fn(),
}));

describe('OCR Utilities', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('preprocessImage', () => {
    test('should return a blob', async () => {
      // Create a mock file
      const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
      
      // Call the function
      const result = await preprocessImage(mockFile);
      
      // Check the result
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('processImageWithOcr', () => {
    test('should call Tesseract.recognize with correct parameters', async () => {
      // Mock Tesseract.recognize to return a successful result
      (Tesseract.recognize as jest.Mock).mockResolvedValue({
        data: {
          text: 'Sample OCR text',
          confidence: 95.5
        }
      });

      // Create a mock file
      const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
      
      // Call the function
      await processImageWithOcr(mockFile, { lang: 'spa', imagePreprocessing: true });
      
      // Check if Tesseract was called with correct parameters
      expect(Tesseract.recognize).toHaveBeenCalledWith(
        expect.any(Blob),
        'spa',
        expect.objectContaining({
          logger: expect.any(Function)
        })
      );
    });

    test('should return extracted text and confidence', async () => {
      // Mock Tesseract.recognize to return a successful result
      (Tesseract.recognize as jest.Mock).mockResolvedValue({
        data: {
          text: 'Sample OCR text',
          confidence: 95.5
        }
      });

      // Create a mock file
      const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
      
      // Call the function
      const result = await processImageWithOcr(mockFile);
      
      // Check the result
      expect(result).toEqual({
        text: 'Sample OCR text',
        confidence: 95.5
      });
    });

    test('should throw an error when OCR processing fails', async () => {
      // Mock Tesseract.recognize to throw an error
      (Tesseract.recognize as jest.Mock).mockRejectedValue(new Error('OCR failed'));

      // Create a mock file
      const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
      
      // Call the function and expect it to throw
      await expect(processImageWithOcr(mockFile)).rejects.toThrow('Failed to process image with OCR');
    });

    test('should skip preprocessing when imagePreprocessing is false', async () => {
      // Spy on preprocessImage
      const preprocessSpy = jest.spyOn({ preprocessImage }, 'preprocessImage');
      
      // Mock Tesseract.recognize to return a successful result
      (Tesseract.recognize as jest.Mock).mockResolvedValue({
        data: {
          text: 'Sample OCR text',
          confidence: 95.5
        }
      });

      // Create a mock file
      const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
      
      // Call the function with preprocessing disabled
      await processImageWithOcr(mockFile, { imagePreprocessing: false });
      
      // Check that preprocessImage was not called
      expect(preprocessSpy).not.toHaveBeenCalled();
    });
  });

  describe('extractBillData', () => {
    test('should extract company name correctly', () => {
      const text = 'Factura de Iberdrola\nPeriodo: 01/01/2023 hasta 31/01/2023\nImporte total: 85,50 €\nConsumo: 350 kWh\nPrecio: 0,25 €/kWh';
      const result = extractBillData(text, 90);
      
      expect(result.companyName.toLowerCase()).toContain('iberdrola');
      expect(result.confidence.fields.companyName).toBeGreaterThan(0);
    });

    test('should extract billing period correctly', () => {
      const text = 'Factura de Endesa\nPeriodo: 01/02/2023 hasta 28/02/2023\nImporte total: 92,30 €\nConsumo: 370 kWh\nPrecio: 0,25 €/kWh';
      const result = extractBillData(text, 90);
      
      expect(result.billingPeriod).toContain('01/02/2023');
      expect(result.billingPeriod).toContain('28/02/2023');
      expect(result.confidence.fields.billingPeriod).toBeGreaterThan(0);
    });

    test('should extract total amount correctly', () => {
      const text = 'Factura de Naturgy\nPeriodo: 01/03/2023 hasta 31/03/2023\nImporte total: 78,45 €\nConsumo: 310 kWh\nPrecio: 0,25 €/kWh';
      const result = extractBillData(text, 90);
      
      expect(result.totalAmount).toBe('78,45');
      expect(result.confidence.fields.totalAmount).toBeGreaterThan(0);
    });

    test('should extract consumption correctly', () => {
      const text = 'Factura de Repsol\nPeriodo: 01/04/2023 hasta 30/04/2023\nImporte total: 65,75 €\nConsumo: 260 kWh\nPrecio: 0,25 €/kWh';
      const result = extractBillData(text, 90);
      
      expect(result.consumption).toBe('260');
      expect(result.confidence.fields.consumption).toBeGreaterThan(0);
    });

    test('should extract rate correctly', () => {
      const text = 'Factura de Total Energies\nPeriodo: 01/05/2023 hasta 31/05/2023\nImporte total: 70,25 €\nConsumo: 280 kWh\nPrecio: 0,25 €/kWh';
      const result = extractBillData(text, 90);
      
      expect(result.rate).toBe('0,25');
      expect(result.confidence.fields.rate).toBeGreaterThan(0);
    });

    test('should handle missing fields gracefully', () => {
      const text = 'Factura de Iberdrola\nPeriodo: 01/06/2023 hasta 30/06/2023\nImporte total: 82,50 €';
      const result = extractBillData(text, 90);
      
      expect(result.companyName.toLowerCase()).toContain('iberdrola');
      expect(result.billingPeriod).toContain('01/06/2023');
      expect(result.totalAmount).toBe('82,50');
      expect(result.consumption).toBe('N/A');
      expect(result.rate).toBe('N/A');
    });

    test('should set overall confidence based on input confidence', () => {
      const text = 'Factura de Iberdrola\nPeriodo: 01/07/2023 hasta 31/07/2023\nImporte total: 88,75 €\nConsumo: 355 kWh\nPrecio: 0,25 €/kWh';
      const result = extractBillData(text, 85);
      
      expect(result.confidence.overall).toBe(85);
    });
  });
});