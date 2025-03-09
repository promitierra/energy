import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartErrorBoundary from '../../../components/ui/ChartErrorBoundary';

// Componente que lanza un error controlado
const ThrowError = ({ message = 'Test error' }) => {
  throw new Error(message);
};

describe('ChartErrorBoundary', () => {
  const originalError = console.error;
  
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    (console.error as jest.Mock).mockClear();
  });

  it('renderiza el contenido cuando no hay error', () => {
    render(
      <ChartErrorBoundary chartName="Test Chart">
        <div>Contenido del gráfico</div>
      </ChartErrorBoundary>
    );
    
    expect(screen.getByText('Contenido del gráfico')).toBeInTheDocument();
    expect(screen.queryByText(/error en el gráfico/i)).not.toBeInTheDocument();
  });

  it('muestra UI de error cuando ocurre un error', () => {
    render(
      <ChartErrorBoundary chartName="Test Chart">
        <ThrowError />
      </ChartErrorBoundary>
    );

    expect(screen.getByText(/error en el gráfico test chart/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('permite reintentar cargar el gráfico', () => {
    const onReset = jest.fn();
    
    render(
      <ChartErrorBoundary chartName="Test Chart" onReset={onReset}>
        <ThrowError />
      </ChartErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('maneja múltiples errores consecutivos', () => {
    const { rerender } = render(
      <ChartErrorBoundary chartName="Test Chart">
        <ThrowError message="Error 1" />
      </ChartErrorBoundary>
    );

    expect(screen.getByText(/error en el gráfico test chart/i)).toBeInTheDocument();

    rerender(
      <ChartErrorBoundary chartName="Test Chart">
        <ThrowError message="Error 2" />
      </ChartErrorBoundary>
    );

    expect(screen.getByText(/error en el gráfico test chart/i)).toBeInTheDocument();
  });
});