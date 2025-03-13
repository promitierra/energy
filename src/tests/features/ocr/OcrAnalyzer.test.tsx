import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OcrAnalyzer from '../../../features/ocr/OcrAnalyzer';
import * as ocrUtils from '../../../features/ocr/ocrUtils';

// Mock the ocrUtils module
jest.mock('../../../features/ocr/ocrUtils', () => ({
  processBill: jest.fn(),
  preprocessImage: jest.fn(),
  processImageWithOcr: jest.fn(),
  extractBillData: jest.fn()
}));

// Mock FileReader
class MockFileReader {
  onload: Function = () => {};
  onerror: Function = () => {};
  readAsDataURL(file: Blob) {
    setTimeout(() => {
      this.onload({ target: { result: 'data:image/png;base64,mockImageData' } });
    }, 0);
  }
}

// Replace the global FileReader with our mock
global.FileReader = MockFileReader as any;

describe('OcrAnalyzer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component correctly', () => {
    render(<OcrAnalyzer />);
    
    // Check for main elements - updated to match actual component text
    expect(screen.getByText(/Análisis OCR de Facturas/i)).toBeInTheDocument();
    expect(screen.getByText(/Suba una imagen de su factura eléctrica/i)).toBeInTheDocument();
    expect(screen.getByText(/Seleccionar Factura/i)).toBeInTheDocument();
  });

  test('handles file upload correctly', async () => {
    render(<OcrAnalyzer />);
    
    // Create a mock file
    const file = new File(['dummy content'], 'bill.png', { type: 'image/png' });
    
    // Get the file input and upload the file - updated to match actual component
    const fileInput = screen.getByLabelText(/raised-button-file/i);
    userEvent.upload(fileInput, file);
    
    // Check that the file preview is displayed
    await waitFor(() => {
      expect(screen.getByAltText(/Vista previa/i)).toBeInTheDocument();
    });
  });

  test('displays image quality assessment after upload', async () => {
    render(<OcrAnalyzer />);
    
    // Create a mock file
    const file = new File(['dummy content'], 'bill.png', { type: 'image/png' });
    
    // Get the file input and upload the file - updated to match actual component
    const fileInput = screen.getByLabelText(/raised-button-file/i);
    userEvent.upload(fileInput, file);
    
    // Check that the image quality assessment is displayed
    await waitFor(() => {
      const qualityElement = screen.getByText(/Calidad de imagen/i);
      expect(qualityElement).toBeInTheDocument();
    });
  });

  test('processes bill when process button is clicked', async () => {
    // Mock the processBill function to return a successful result
    const mockResult = {
      companyName: 'Iberdrola',
      billingPeriod: '01/01/2023 - 31/01/2023',
      totalAmount: '85,50€',
      consumption: '350 kWh',
      rate: '0,25€/kWh',
      confidence: {
        overall: 0.9,
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
    
    (ocrUtils.processBill as jest.Mock).mockResolvedValue(mockResult);
    
    render(<OcrAnalyzer />);
    
    // Create a mock file
    const file = new File(['dummy content'], 'bill.png', { type: 'image/png' });
    
    // Get the file input and upload the file - updated to match actual component
    const fileInput = screen.getByLabelText(/raised-button-file/i);
    userEvent.upload(fileInput, file);
    
    // Wait for the image to be loaded
    await waitFor(() => {
      expect(screen.getByAltText(/Vista previa/i)).toBeInTheDocument();
    });
    
    // Click the process button - updated to match actual component
    const processButton = screen.getByText(/Procesar Factura/i);
    fireEvent.click(processButton);
    
    // Check that the loading indicator is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for the results to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Resultados del Análisis/i)).toBeInTheDocument();
      expect(screen.getByText(/Iberdrola/i)).toBeInTheDocument();
      expect(screen.getByText(/85,50€/i)).toBeInTheDocument();
    });
    
    // Check that processBill was called with the correct parameters
    expect(ocrUtils.processBill).toHaveBeenCalledWith(file, expect.any(Object));
  });

  test('handles processing errors correctly', async () => {
    // Mock the processBill function to throw an error
    (ocrUtils.processBill as jest.Mock).mockRejectedValue(new Error('Processing failed'));
    
    render(<OcrAnalyzer />);
    
    // Create a mock file
    const file = new File(['dummy content'], 'bill.png', { type: 'image/png' });
    
    // Get the file input and upload the file - updated to match actual component
    const fileInput = screen.getByLabelText(/raised-button-file/i);
    userEvent.upload(fileInput, file);
    
    // Wait for the image to be loaded
    await waitFor(() => {
      expect(screen.getByAltText(/Vista previa/i)).toBeInTheDocument();
    });
    
    // Click the process button - updated to match actual component
    const processButton = screen.getByText(/Procesar Factura/i);
    fireEvent.click(processButton);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error al procesar la factura/i)).toBeInTheDocument();
    });
  });

  test('allows image rotation and cropping', async () => {
    render(<OcrAnalyzer />);
    
    // Create a mock file
    const file = new File(['dummy content'], 'bill.png', { type: 'image/png' });
    
    // Get the file input and upload the file - updated to match actual component
    const fileInput = screen.getByLabelText(/raised-button-file/i);
    userEvent.upload(fileInput, file);
    
    // Wait for the image to be loaded
    await waitFor(() => {
      expect(screen.getByAltText(/Vista previa/i)).toBeInTheDocument();
    });
    
    // Check that the rotation slider is displayed
    const rotationSlider = screen.getByText(/Rotación/i).closest('div')?.querySelector('input');
    expect(rotationSlider).toBeInTheDocument();
    
    // Change the rotation value
    if (rotationSlider) {
      fireEvent.change(rotationSlider, { target: { value: 90 } });
    }
  });
});