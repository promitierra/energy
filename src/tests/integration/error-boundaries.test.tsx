import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import { loadSimulationParams } from '../../utils/simulationParamsLoader';
import { simulationParamsSchema } from '../../schemas/simulationParamsSchema';

// Mock component that uses simulation parameters
const SimulationParamsComponent = ({ throwError = false }) => {
  if (throwError) {
    throw new Error('Simulation parameters error');
  }
  
  // Load simulation parameters
  const params = loadSimulationParams();
  
  return (
    <div>
      <h2>Simulation Parameters</h2>
      <ul>
        <li data-testid="initial-investment">Initial Investment: {params.initialInvestment}</li>
        <li data-testid="system-lifespan">System Lifespan: {params.systemLifespan}</li>
        <li data-testid="maintenance-cost">Maintenance Cost: {params.maintenanceCost}</li>
      </ul>
    </div>
  );
};

// Mock the simulationParamsLoader module
jest.mock('../../utils/simulationParamsLoader', () => ({
  loadSimulationParams: jest.fn()
}));

describe('Error Boundaries for Simulation Parameters', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render simulation parameters component successfully', () => {
    // Mock successful loading of simulation parameters
    (loadSimulationParams as jest.Mock).mockReturnValue({
      initialInvestment: 10000,
      systemLifespan: 25,
      maintenanceCost: 200,
      annualDegradation: 0.5,
      energyPriceInflation: 2.5,
      updatedAt: '2024-01-01T00:00:00Z'
    });
    
    render(<SimulationParamsComponent />);
    
    expect(screen.getByTestId('initial-investment')).toHaveTextContent('Initial Investment: 10000');
    expect(screen.getByTestId('system-lifespan')).toHaveTextContent('System Lifespan: 25');
    expect(screen.getByTestId('maintenance-cost')).toHaveTextContent('Maintenance Cost: 200');
  });
  
  it('should catch errors in simulation parameters component', () => {
    render(
      <ErrorBoundary>
        <SimulationParamsComponent throwError={true} />
      </ErrorBoundary>
    );
    
    // Error boundary should show error message
    expect(screen.getByText(/Error al cargar el componente/i)).toBeInTheDocument();
  });
  
  it('should catch errors when simulation parameters loading fails', () => {
    // Mock loadSimulationParams to throw an error
    (loadSimulationParams as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to load simulation parameters');
    });
    
    render(
      <ErrorBoundary>
        <SimulationParamsComponent />
      </ErrorBoundary>
    );
    
    // Error boundary should show error message
    expect(screen.getByText(/Error al cargar el componente/i)).toBeInTheDocument();
  });
  
  it('should catch errors when simulation parameters validation fails', () => {
    // Mock loadSimulationParams to return invalid data that would fail validation
    (loadSimulationParams as jest.Mock).mockImplementation(() => {
      // This would normally be caught by the schema validation in the real loader
      // but we're bypassing that to test the error boundary
      return {
        initialInvestment: -1000, // Invalid negative value
        systemLifespan: 25,
        maintenanceCost: 200,
        annualDegradation: 0.5,
        energyPriceInflation: 2.5,
        updatedAt: '2024-01-01T00:00:00Z'
      };
    });
    
    // Create a component that validates the data
    const ValidatingComponent = () => {
      const params = loadSimulationParams();
      // Manually validate to trigger an error
      const result = simulationParamsSchema.safeParse(params);
      if (!result.success) {
        throw new Error(`Validation failed: ${result.error.message}`);
      }
      return <SimulationParamsComponent />;
    };
    
    render(
      <ErrorBoundary>
        <ValidatingComponent />
      </ErrorBoundary>
    );
    
    // Error boundary should show error message
    expect(screen.getByText(/Error al cargar el componente/i)).toBeInTheDocument();
  });
});