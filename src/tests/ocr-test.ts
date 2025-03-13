import fs from 'fs';
import path from 'path';
import { extractBillData, OcrExtractionResult } from '../features/ocr/ocrUtils';
import Tesseract from 'tesseract.js';

/**
 * Test script for OCR functionality with real bill images
 * This script loads the sample bill images and processes them with the OCR utilities
 */

async function testOcrWithBillImages() {
  console.log('Starting OCR test with bill images...');
  
  const billImages = [
    { name: 'FACT_ENE_001.png', path: path.join(__dirname, '../../docs/investigacion/FACT_ENE_001.png') },
    { name: 'FACT_GAS_001.png', path: path.join(__dirname, '../../docs/investigacion/FACT_GAS_001.png') }
  ];
  
  for (const billImage of billImages) {
    console.log(`\nProcessing ${billImage.name}...`);
    
    try {
      // Process the image with OCR directly using Tesseract
      console.log('Applying OCR processing...');
      const startTime = Date.now();
      
      // Use Tesseract directly since we're in Node.js environment
      const tesseractResult = await Tesseract.recognize(
        billImage.path,
        'spa',
        {
          logger: m => console.log(m)
        }
      );
      
      // Extract data from OCR text
      const result = extractBillData(tesseractResult.data.text, tesseractResult.data.confidence);
      
      const processingTime = Date.now() - startTime;
      
      // Display results
      console.log('OCR Processing completed in', processingTime, 'ms');
      console.log('Extraction results:');
      console.log('-------------------');
      console.log(`Company: ${result.companyName}`);
      console.log(`Billing Period: ${result.billingPeriod}`);
      console.log(`Total Amount: ${result.totalAmount}`);
      console.log(`Consumption: ${result.consumption}`);
      console.log(`Rate: ${result.rate}`);
      console.log(`Overall Confidence: ${result.confidence.overall.toFixed(2)}`);
      console.log('Field Confidence:');
      
      Object.entries(result.confidence.fields).forEach(([field, confidence]) => {
        console.log(`  - ${field}: ${confidence.toFixed(2)}`);
      });
      
      // Evaluate extraction quality
      evaluateExtractionQuality(billImage.name, result);
      
    } catch (error) {
      console.error(`Error processing ${billImage.name}:`, error);
    }
  }
}

/**
 * Evaluate the quality of the extraction results
 */
function evaluateExtractionQuality(imageName: string, result: OcrExtractionResult) {
  console.log('\nExtraction Quality Evaluation:');
  console.log('----------------------------');
  
  // Check if essential fields were extracted
  const essentialFields = ['companyName', 'totalAmount', 'billingPeriod'];
  const missingFields = essentialFields.filter(field => 
    result[field as keyof OcrExtractionResult] === 'No detectado'
  );
  
  if (missingFields.length > 0) {
    console.log(`❌ Missing essential fields: ${missingFields.join(', ')}`);
  } else {
    console.log('✅ All essential fields extracted');
  }
  
  // Evaluate overall confidence
  if (result.confidence.overall < 0.5) {
    console.log('❌ Low overall confidence (<0.5)');
  } else if (result.confidence.overall < 0.7) {
    console.log('⚠️ Medium overall confidence (0.5-0.7)');
  } else {
    console.log('✅ High overall confidence (>0.7)');
  }
  
  // Check for specific patterns in the extracted text based on the bill type
  if (imageName.includes('ENE')) {
    // Electricity bill specific checks
    const hasKwh = result.rawText.toLowerCase().includes('kwh');
    console.log(hasKwh ? '✅ Contains electricity-specific terms (kWh)' : '❌ Missing electricity-specific terms');
  } else if (imageName.includes('GAS')) {
    // Gas bill specific checks
    const hasGasTerms = result.rawText.toLowerCase().includes('m3') || 
                        result.rawText.toLowerCase().includes('gas');
    console.log(hasGasTerms ? '✅ Contains gas-specific terms (m3/gas)' : '❌ Missing gas-specific terms');
  }
  
  // Suggest improvements
  console.log('\nSuggested Improvements:');
  
  if (result.confidence.overall < 0.7) {
    console.log('- Consider enhancing image preprocessing for better text recognition');
  }
  
  // Check for low confidence fields
  const lowConfidenceFields = Object.entries(result.confidence.fields)
    .filter(([_, confidence]) => confidence < 0.6)
    .map(([field]) => field);
  
  if (lowConfidenceFields.length > 0) {
    console.log(`- Improve pattern matching for: ${lowConfidenceFields.join(', ')}`);
  }
  
  // Check if the bill type is correctly identified
  if (imageName.includes('ENE') && !result.companyName.toLowerCase().includes('electr')) {
    console.log('- Enhance company name detection for electricity providers');
  } else if (imageName.includes('GAS') && !result.companyName.toLowerCase().includes('gas')) {
    console.log('- Enhance company name detection for gas providers');
  }
}

// Run the test
testOcrWithBillImages().catch(error => {
  console.error('Test failed:', error);
});