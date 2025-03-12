import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ValidationComponent from '../../../features/validation/ValidationComponent';
import * as validationUtils from '../../../features/validation/validationUtils';
import { InstallationData, ValidationComparison } from '../../../features/validation/types';

// Mock the validationUtils module
jest.mock('../../../features/validation/validationUtils', () => ({
  compareWithPredictions: jest.fn(),
  generateSampleInstallationData: jest.fn(),
}));

describe('ValidationComponent', () => {
  // Sample data for tests
  const sampleInstallationData: InstallationData = {
    installationId: 'test-123',
    installationName: 'Test Installation',
    installationType: 'residential',
    location: {
      city: 'Madrid',
      region: 'Madrid',
      country: 'Spain'
    },
    installedCapacity: 5,
    installationDate: '2022-01-01',
    readings: [
      {
        timestamp: '2023-01-01T12:00:00Z',
        period: 'daily',
        consumption: 15,
        production: 10
      }
    ]
  };

  const sampleComparisonResult: ValidationComparison = {
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
        deviation: 6.25
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the generateSampleInstallationData function
    (validationUtils.generateSampleInstallationData as jest.Mock).mockReturnValue(sampleInstallationData);
    // Mock the compareWithPredictions function
    (validationUtils.compareWithPredictions as jest.Mock).mockReturnValue(sampleComparisonResult);
  });

  test('renders the component correctly', () => {
    render(<ValidationComponent />);
    
    // Check for main elements
    expect(screen.getByText(/Validación con Datos Reales/i)).toBeInTheDocument();
    expect(screen.getByText(/Datos de la Instalación/i)).toBeInTheDocument();
    expect(screen.getByText(/Configuración de Validación/i)).toBeInTheDocument();
  });

  test('loads sample data when button is clicked', async () => {
    render(<ValidationComponent />);
    
    // Click the load sample data button
    const loadButton = screen.getByText(/Cargar datos de muestra/i);
    fireEvent.click(loadButton);
    
    // Check that the loading indicator is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for the data to be loaded
    await waitFor(() => {
      expect(screen.getByText(/Test Installation/i)).toBeInTheDocument();
      expect(screen.getByText(/Madrid, Spain/i)).toBeInTheDocument();
      expect(screen.getByText(/5 kW/i)).toBeInTheDocument();
    });
    
    // Check that the function was called
    expect(validationUtils.generateSampleInstallationData).toHaveBeenCalled();
  });

  test('handles file upload for installation data', async () => {
    render(<ValidationComponent />);
    
    // Create a mock file with JSON content
    const fileContent = JSON.stringify(sampleInstallationData);
    const file = new File([fileContent], 'installation.json', { type: 'application/json' });
    
    // Get the file input and upload the file
    const fileInput = screen.getByLabelText(/Seleccionar archivo/i);
    userEvent.upload(fileInput, file);
    
    // Wait for the data to be loaded
    await waitFor(() => {
      expect(screen.getByText(/Test Installation/i)).toBeInTheDocument();
    });
  });

  test('handles invalid JSON file upload', async () => {
    render(<ValidationComponent />);
    
    // Create an invalid JSON file
    const file = new File(['invalid json content'], 'invalid.json', { type: 'application/json' });
    
    // Mock the FileReader onload event to simulate JSON parsing error
    const originalFileReader = global.FileReader;
    class MockFileReader {
      onload: Function = () => {};
      onerror: Function = () => {};
      readAsText(file: Blob) {
        setTimeout(() => {
          this.onload({ target: { result: 'invalid json content' } });
        }, 0);
      }
    }
    global.FileReader = MockFileReader as any;
    
    // Get the file input and upload the file
    const fileInput = screen.getByLabelText(/Seleccionar archivo/i);
    userEvent.upload(fileInput, file);
    
    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/El archivo no contiene datos válidos/i)).toBeInTheDocument();
    });
    
    // Restore the original FileReader
    global.FileReader = originalFileReader;
  });

  test('runs validation when validate button is clicked', async () => {
    render(<ValidationComponent />);
    
    // Load sample data first
    const loadButton = screen.getByText(/Cargar datos de muestra/i);
    fireEvent.click(loadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Installation/i)).toBeInTheDocument();
    });
    
    // Click the validate button
    const validateButton = screen.getByText(/Ejecutar validación/i);
    fireEvent.click(validateButton);
    
    // Check that the loading indicator is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for the results to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Resultados de la Validación/i)).toBeInTheDocument();
      expect(screen.getByText(/7.14%/i)).toBeInTheDocument(); // Deviation percentage
    });
    
    // Check that compareWithPredictions was called
    expect(validationUtils.compareWithPredictions).toHaveBeenCalled();
  });

  test('changes validation settings correctly', () => {
    render(<ValidationComponent />);
    
    // Change the comparison period
    const periodSelect = screen.getByLabelText(/Periodo de comparación/i);
    fireEvent.change(periodSelect, { target: { value: 'monthly' } });
    
    // Toggle the normalize weather switch
    const normalizeSwitch = screen.getByLabelText(/Normalizar condiciones climáticas/i);
    fireEvent.click(normalizeSwitch);
    
    // Check that the settings were updated
    expect(periodSelect).toHaveValue('monthly');
    expect(normalizeSwitch).not.toBeChecked();
  });

  test('displays charts when results are available', async () => {
    // Mock the recharts components
    jest.mock('recharts', () => ({
      LineChart: () => <div data-testid="line-chart" />,
      Line: () => <div />,
      XAxis: () => <div />,
      YAxis: () => <div />,
      CartesianGrid: () => <div />,
      Tooltip: () => <div />,
      Legend: () => <div />,
      ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      BarChart: () => <div data-testid="bar-chart" />,
      Bar: () => <div />
    }));
    
    render(<ValidationComponent />);
    
    // Load sample data
    const loadButton = screen.getByText(/Cargar datos de muestra/i);
    fireEvent.click(loadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Installation/i)).toBeInTheDocument();
    });
    
    // Run validation
    const validateButton = screen.getByText(/Ejecutar validación/i);
    fireEvent.click(validateButton);
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/Resultados de la Validación/i)).toBeInTheDocument();
    });
    
    // Check for charts (this will depend on how charts are rendered in the component)
    expect(screen.getByText(/Comparación de Consumo/i)).toBeInTheDocument();
    expect(screen.getByText(/Comparación de Producción/i)).toBeInTheDocument();
  });
});