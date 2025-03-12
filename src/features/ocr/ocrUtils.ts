import Tesseract from 'tesseract.js';

/**
 * Utility functions for OCR processing of electricity bills
 */

/**
 * Interface for OCR processing options
 */
export interface OcrProcessingOptions {
  lang?: string;
  imagePreprocessing?: boolean;
}

/**
 * Interface for OCR extraction results
 */
export interface OcrExtractionResult {
  companyName: string;
  billingPeriod: string;
  totalAmount: string;
  consumption: string;
  rate: string;
  confidence: {
    overall: number;
    fields: Record<string, number>;
  };
  rawText: string;
}

/**
 * Preprocess image for better OCR results
 * @param imageFile The image file to preprocess
 * @returns A processed image blob
 */
export const preprocessImage = async (imageFile: File): Promise<Blob> => {
  // In a real implementation, this would apply image processing techniques
  // like contrast enhancement, noise reduction, etc.
  // For now, we'll just return the original file
  return imageFile;
};

/**
 * Process an image using Tesseract OCR
 * @param imageFile The image file to process
 * @param options OCR processing options
 * @returns The extracted text and confidence
 */
export const processImageWithOcr = async (
  imageFile: File,
  options: OcrProcessingOptions = {}
): Promise<{ text: string; confidence: number }> => {
  const { lang = 'spa', imagePreprocessing = true } = options;
  
  // Preprocess image if enabled
  const imageToProcess = imagePreprocessing 
    ? await preprocessImage(imageFile)
    : imageFile;
  
  try {
    const result = await Tesseract.recognize(
      imageToProcess,
      lang,
      {
        logger: m => console.log(m)
      }
    );
    
    return {
      text: result.data.text,
      confidence: result.data.confidence
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process image with OCR');
  }
};

/**
 * Extract structured data from OCR text
 * @param text The OCR extracted text
 * @returns Structured data extracted from the text
 */
export const extractBillData = (text: string, confidence: number): OcrExtractionResult => {
  // In a real implementation, this would use regex patterns or NLP
  // to extract specific fields from the OCR text
  // For now, we'll implement a simple pattern matching approach
  
  // Example patterns for Spanish electricity bills
  const companyPattern = /(iberdrola|endesa|naturgy|repsol|total energies)/i;
  const periodPattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s*[a|hasta]+\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i;
  const amountPattern = /(total|importe)[:\s]*(\d+[,\.]\d{2})\s*[€|eur]/i;
  const consumptionPattern = /(consumo)[:\s]*(\d+[,\.]?\d*)\s*(kwh)/i;
  const ratePattern = /(precio|tarifa)[:\s]*(\d+[,\.]\d*)\s*[€|eur]\/(kwh)/i;
  
  // Extract data using patterns
  const companyMatch = text.match(companyPattern);
  const periodMatch = text.match(periodPattern);
  const amountMatch = text.match(amountPattern);
  const consumptionMatch = text.match(consumptionPattern);
  const rateMatch = text.match(ratePattern);
  
  // Calculate confidence for each field
  const fieldConfidence = {
    companyName: companyMatch ? 0.8 : 0.3,
    billingPeriod: periodMatch ? 0.9 : 0.4,
    totalAmount: amountMatch ? 0.85 : 0.3,
    consumption: consumptionMatch ? 0.8 : 0.3,
    rate: rateMatch ? 0.75 : 0.3
  };
  
  // Calculate overall confidence
  const overallConfidence = Object.values(fieldConfidence).reduce(
    (sum, value) => sum + value, 0
  ) / Object.values(fieldConfidence).length;
  
  return {
    companyName: companyMatch ? companyMatch[0] : 'No detectado',
    billingPeriod: periodMatch ? `${periodMatch[1]} - ${periodMatch[2]}` : 'No detectado',
    totalAmount: amountMatch ? `${amountMatch[2]}€` : 'No detectado',
    consumption: consumptionMatch ? `${consumptionMatch[2]} kWh` : 'No detectado',
    rate: rateMatch ? `${rateMatch[2]}€/kWh` : 'No detectado',
    confidence: {
      overall: overallConfidence,
      fields: fieldConfidence
    },
    rawText: text
  };
};

/**
 * Process an electricity bill image and extract structured data
 * @param imageFile The bill image file
 * @param options OCR processing options
 * @returns Structured data extracted from the bill
 */
export const processBill = async (
  imageFile: File,
  options: OcrProcessingOptions = {}
): Promise<OcrExtractionResult> => {
  // Process image with OCR
  const { text, confidence } = await processImageWithOcr(imageFile, options);
  
  // Extract structured data from OCR text
  return extractBillData(text, confidence);
};