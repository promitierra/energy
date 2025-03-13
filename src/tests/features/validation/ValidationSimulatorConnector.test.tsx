import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ValidationSimulatorConnector from '../../../features/validation/ValidationSimulatorConnector';
import { ValidationComparison } from '../../../features/validation/types';

describe('ValidationSimulatorConnector Component', () => {
  // Sample validation comparison data for testing
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
    hourlyComparison: [
      {
        timestamp: '2023-01-15T12:00:00Z',
        consumption: { predicted: 15, actual: 14 },
        production: { predicted: 10, actual: 11 }
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

  // Mock function for applying calibration to simulator
  const mockOnApplyToSimulator = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with validation data', () => {
    render(
      <ValidationSimulatorConnector
        validationData={sampleValidationData}
        onApplyToSimulator={mockOnApplyToSimulator}
      />
    );

    // Check for main component elements
    expect(screen.getByText(/Aplicar Resultados de Validación/i)).toBeInTheDocument();
    expect(screen.getByText(/test-123/i)).toBeInTheDocument(); // Installation ID
    expect(screen.getByText(/01\/01\/2023/i)).toBeInTheDocument(); // Start date
    expect(screen.getByText(/31\/01\/2023/i)).toBeInTheDocument(); // End date
  });

  test('renders empty state correctly', () => {
    render(
      <ValidationSimulatorConnector
        validationData={null}
        onApplyToSimulator={mockOnApplyToSimulator}
      />
    );

    // Check for empty state message
    expect(screen.getByText(/No hay datos de validación disponibles/i)).toBeInTheDocument();
  });

  test('displays calibration recommendations based on validation data', () => {
    render(
      <ValidationSimulatorConnector
        validationData={sampleValidationData}
        onApplyToSimulator={mockOnApplyToSimulator}
      />
    );

    // Check for recommendation elements
    expect(screen.getByText(/Recomendaciones de Calibración/i)).toBeInTheDocument();
    expect(screen.getByText(/Factor de Consumo/i)).toBeInTheDocument();
    expect(screen.getByText(/Factor de Producción/i)).toBeInTheDocument();
  });

  test('allows adjusting calibration factors', async () => {
    render(
      <ValidationSimulatorConnector
        validationData={sampleValidationData}
        onApplyToSimulator={mockOnApplyToSimulator}
      />
    );

    // Find and adjust consumption factor slider
    const consumptionSlider = screen.getByLabelText(/Factor de Consumo/i);
    fireEvent.change(consumptionSlider, { target: { value: '0.9' } });

    // Find and adjust production factor slider
    const productionSlider = screen.getByLabelText(/Factor de Producción/i);
    fireEvent.change(productionSlider, { target: { value: '1.1' } });

    // Toggle weather normalization
    const weatherSwitch = screen.getByLabelText(/Aplicar normalización climática/i);
    fireEvent.click(weatherSwitch);

    // Click apply button
    const applyButton = screen.getByText(/Aplicar al Simulador/i);
    fireEvent.click(applyButton);

    // Check if the callback was called with the correct data
    await waitFor(() => {
      expect(mockOnApplyToSimulator).toHaveBeenCalledTimes(1);
      expect(mockOnApplyToSimulator).toHaveBeenCalledWith(
        expect.objectContaining({
          consumptionFactor: 0.9,
          productionFactor: 1.1,
          applyWeatherNormalization: false
        })
      );
    });
  });

  test('shows confidence threshold adjustment', () => {
    render(
      <ValidationSimulatorConnector
        validationData={sampleValidationData}
        onApplyToSimulator={mockOnApplyToSimulator}
      />
    );

    // Check for confidence threshold elements
    expect(screen.getByText(/Umbral de Confianza/i)).toBeInTheDocument();
    
    // Adjust confidence threshold
    const confidenceSlider = screen.getByLabelText(/Umbral de Confianza/i);
    fireEvent.change(confidenceSlider, { target: { value: '70' } });
    
    // Verify the value was updated in the UI
    expect(screen.getByText(/70%/i)).toBeInTheDocument();
  });

  test('displays anomaly information from validation data', () => {
    render(
      <ValidationSimulatorConnector
        validationData={sampleValidationData}
        onApplyToSimulator={mockOnApplyToSimulator}
      />
    );

    // Check for anomaly information
    expect(screen.getByText(/Anomalías Detectadas/i)).toBeInTheDocument();
    expect(screen.getByText(/20\/01\/2023/i)).toBeInTheDocument(); // Anomaly date
    expect(screen.getByText(/consumo/i)).toBeInTheDocument(); // Anomaly metric
    expect(screen.getByText(/40%/i)).toBeInTheDocument(); // Anomaly deviation
  });
});