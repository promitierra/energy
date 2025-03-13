import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ParameterOptimizationComponent from '../../../features/validation/ParameterOptimizationComponent';
import { generateSampleInstallationData } from '../../../features/validation/validationUtils';
import { compareWithPredictions } from '../../../features/validation/validationUtils';
import { defaultParameters } from '../../../features/validation/parameterAdjustment';

// Mock the optimizeParameters function
jest.mock('../../../features/validation/parameterAdjustment', () => {
  const originalModule = jest.requireActual('../../../features/validation/parameterAdjustment');
  return {
    ...originalModule,
    optimizeParameters: jest.fn(() => ({
      ...originalModule.defaultParameters,
      // Return slightly modified parameters to simulate optimization
      temperatureCoefficient: -0.005,
      winterConsumptionFactor: 1.35,
      summerProductionFactor: 1.25
    }))
  };
});

describe('ParameterOptimizationComponent', () => {
  const mockInstallationData = generateSampleInstallationData();
  
  // Generate mock validation result
  const mockPredictions = {
    consumption: mockInstallationData.readings
      .filter(r => r.period.toLowerCase() === 'daily')
      .map(r => r.consumption * 0.9), // 90% of actual (10% underestimation)
    production: mockInstallationData.readings
      .filter(r => r.period.toLowerCase() === 'daily')
      .filter(r => r.production !== undefined)
      .map(r => (r.production || 0) * 1.1), // 110% of actual (10% overestimation)
    timestamps: mockInstallationData.readings
      .filter(r => r.period.toLowerCase() === 'daily')
      .map(r => r.timestamp)
  };
  
  const mockValidationResult = compareWithPredictions(
    mockInstallationData,
    mockPredictions,
    {
      comparisonPeriod: 'daily',
      metrics: ['consumption', 'production', 'selfConsumption'],
      normalizeWeather: true,
      excludeOutliers: true
    }
  );
  
  const mockOnParametersOptimized = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders info message when no data is provided', () => {
    render(
      <ParameterOptimizationComponent 
        installationData={null} 
        validationResult={null} 
        onParametersOptimized={mockOnParametersOptimized}
      />
    );
    
    expect(screen.getByText('Optimización de Parámetros')).toBeInTheDocument();
    expect(screen.getByText(/Ejecute primero una validación/)).toBeInTheDocument();
  });
  
  test('renders optimization interface when data is provided', () => {
    render(
      <ParameterOptimizationComponent 
        installationData={mockInstallationData} 
        validationResult={mockValidationResult} 
        onParametersOptimized={mockOnParametersOptimized}
      />
    );
    
    // Check that main sections are rendered
    expect(screen.getByText('Optimización de Parámetros')).toBeInTheDocument();
    expect(screen.getByText('Opciones de Optimización')).toBeInTheDocument();
    expect(screen.getByText('Parámetros del Algoritmo')).toBeInTheDocument();
    
    // Check that parameter sections are rendered
    expect(screen.getByText('Parámetros de Normalización Climática')).toBeInTheDocument();
    expect(screen.getByText('Parámetros de Ajuste Estacional')).toBeInTheDocument();
    expect(screen.getByText('Parámetros de Ajuste por Hora')).toBeInTheDocument();
    expect(screen.getByText('Parámetros de Detección de Valores Atípicos')).toBeInTheDocument();
    
    // Check that buttons are rendered
    expect(screen.getByText('Ejecutar Optimización')).toBeInTheDocument();
    expect(screen.getByText('Restablecer Valores')).toBeInTheDocument();
  });
  
  test('runs optimization when button is clicked', async () => {
    render(
      <ParameterOptimizationComponent 
        installationData={mockInstallationData} 
        validationResult={mockValidationResult} 
        onParametersOptimized={mockOnParametersOptimized}
      />
    );
    
    // Click the optimization button
    fireEvent.click(screen.getByText('Ejecutar Optimización'));
    
    // Check that loading state is shown
    expect(screen.getByText('Optimizando...')).toBeInTheDocument();
    
    // Wait for optimization to complete
    await waitFor(() => {
      expect(screen.getByText(/Mejora conseguida/)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check that callback was called with optimized parameters
    expect(mockOnParametersOptimized).toHaveBeenCalled();
  });
  
  test('resets parameters when reset button is clicked', () => {
    render(
      <ParameterOptimizationComponent 
        installationData={mockInstallationData} 
        validationResult={mockValidationResult} 
        onParametersOptimized={mockOnParametersOptimized}
      />
    );
    
    // First run optimization
    fireEvent.click(screen.getByText('Ejecutar Optimización'));
    
    // Wait for optimization to complete
    return waitFor(() => {
      expect(screen.getByText(/Mejora conseguida/)).toBeInTheDocument();
      
      // Then click reset button
      fireEvent.click(screen.getByText('Restablecer Valores'));
      
      // Check that optimization result is no longer shown
      expect(screen.queryByText(/Mejora conseguida/)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});