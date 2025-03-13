import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OcrSimulatorIntegration from '../../../features/ocr/OcrSimulatorIntegration';
import { OcrExtractionResult } from '../../../features/ocr/ocrUtils';

describe('OcrSimulatorIntegration Component', () => {
  // Sample OCR extraction result for testing
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

  // Mock function for applying data to simulator
  const mockOnApplyToSimulator = jest.fn();
  const mockOnSaveCorrections = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with OCR results', () => {
    render(
      <OcrSimulatorIntegration
        ocrResults={sampleOcrResults}
        onApplyToSimulator={mockOnApplyToSimulator}
        onSaveCorrections={mockOnSaveCorrections}
      />
    );

    // Check for main component elements
    expect(screen.getByText(/Datos Extraídos de la Factura/i)).toBeInTheDocument();
    expect(screen.getByText(/Empresa Energética Test/i)).toBeInTheDocument();
    expect(screen.getByText(/01\/01\/2023 - 31\/01\/2023/i)).toBeInTheDocument();
    expect(screen.getByText(/250/i)).toBeInTheDocument(); // Consumption
    expect(screen.getByText(/600/i)).toBeInTheDocument(); // Rate
  });

  test('renders loading state correctly', () => {
    render(
      <OcrSimulatorIntegration
        ocrResults={sampleOcrResults}
        onApplyToSimulator={mockOnApplyToSimulator}
        isLoading={true}
      />
    );

    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders empty state correctly', () => {
    render(
      <OcrSimulatorIntegration
        ocrResults={null}
        onApplyToSimulator={mockOnApplyToSimulator}
      />
    );

    // Check for empty state message
    expect(screen.getByText(/No hay datos disponibles/i)).toBeInTheDocument();
  });

  test('calls onApplyToSimulator when Apply button is clicked', async () => {
    render(
      <OcrSimulatorIntegration
        ocrResults={sampleOcrResults}
        onApplyToSimulator={mockOnApplyToSimulator}
      />
    );

    // Find and click the Apply button
    const applyButton = screen.getByText(/Aplicar al Simulador/i);
    fireEvent.click(applyButton);

    // Check if the callback was called with the correct data
    await waitFor(() => {
      expect(mockOnApplyToSimulator).toHaveBeenCalledTimes(1);
      expect(mockOnApplyToSimulator).toHaveBeenCalledWith(
        expect.objectContaining({
          consumoMensual: expect.any(String),
          precioElectricidad: expect.any(String)
        })
      );
    });
  });

  test('allows editing of extracted values', async () => {
    render(
      <OcrSimulatorIntegration
        ocrResults={sampleOcrResults}
        onApplyToSimulator={mockOnApplyToSimulator}
        onSaveCorrections={mockOnSaveCorrections}
      />
    );

    // Find consumption input and change its value
    const consumptionInput = screen.getByLabelText(/Consumo Mensual/i);
    fireEvent.change(consumptionInput, { target: { value: '300' } });

    // Find rate input and change its value
    const rateInput = screen.getByLabelText(/Precio Electricidad/i);
    fireEvent.change(rateInput, { target: { value: '650' } });

    // Click apply button
    const applyButton = screen.getByText(/Aplicar al Simulador/i);
    fireEvent.click(applyButton);

    // Check if the callback was called with the updated values
    await waitFor(() => {
      expect(mockOnApplyToSimulator).toHaveBeenCalledWith(
        expect.objectContaining({
          consumoMensual: '300',
          precioElectricidad: '650'
        })
      );
    });
  });

  test('shows Colombian market adaptations', () => {
    render(
      <OcrSimulatorIntegration
        ocrResults={sampleOcrResults}
        onApplyToSimulator={mockOnApplyToSimulator}
      />
    );

    // Check for Colombian market adaptation information
    expect(screen.getByText(/Adaptaciones para el Mercado Colombiano/i)).toBeInTheDocument();
    expect(screen.getByText(/Conversión de tarifas/i)).toBeInTheDocument();
  });

  test('validates input before applying to simulator', async () => {
    render(
      <OcrSimulatorIntegration
        ocrResults={sampleOcrResults}
        onApplyToSimulator={mockOnApplyToSimulator}
      />
    );

    // Find consumption input and set invalid value
    const consumptionInput = screen.getByLabelText(/Consumo Mensual/i);
    fireEvent.change(consumptionInput, { target: { value: '-50' } });

    // Click apply button
    const applyButton = screen.getByText(/Aplicar al Simulador/i);
    fireEvent.click(applyButton);

    // Check that validation error is shown
    expect(screen.getByText(/El consumo debe ser un número positivo/i)).toBeInTheDocument();

    // Check that callback was not called
    expect(mockOnApplyToSimulator).not.toHaveBeenCalled();
  });
});