import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CostosAcumuladosChart from '../../../components/charts/CostosAcumuladosChart';
import { ThemeProvider } from '../../../theme/ThemeProvider';

describe('CostosAcumuladosChart', () => {
  const mockData = [
    { year: 'Año 1', redElectrica: 1000000, panelesSolares: 9000000, generadorGas: 5000000 },
    { year: 'Año 2', redElectrica: 2000000, panelesSolares: 9500000, generadorGas: 6000000 }
  ];

  beforeEach(() => {
    // Mock del ResizeObserver
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Establecer dimensiones del contenedor
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        width: 600,
        height: 400,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      })
    });
  });

  const renderWithTheme = () => {
    return render(
      <ThemeProvider>
        <CostosAcumuladosChart data={mockData} />
      </ThemeProvider>
    );
  };

  it('renderiza el contenedor del gráfico con las dimensiones correctas', () => {
    renderWithTheme();
    const container = screen.getByRole('region');
    expect(container).toHaveAttribute('aria-label', 'Gráfico de costos acumulados por sistema energético');
  });

  it('muestra elementos de navegación por teclado accesibles', () => {
    renderWithTheme();
    const container = screen.getByRole('region');
    expect(container).toHaveAttribute('tabIndex', '0');
  });

  it('proporciona descripción textual para lectores de pantalla', () => {
    renderWithTheme();
    const ariaDescription = screen.getByText(/tendencia general:/i);
    expect(ariaDescription).toBeInTheDocument();
  });

  it('incluye una tabla de datos accesible', () => {
    renderWithTheme();
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /año 1/i })).toBeInTheDocument();
  });
});