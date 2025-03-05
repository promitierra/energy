import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';
import { ThemeProvider } from '../theme/ThemeProvider';

// Mock de los componentes lazy
jest.mock('../graficos-comparativos', () => ({
  __esModule: true,
  default: () => <div>Gráficos Comparativos Mock</div>
}));

jest.mock('../components/SimuladorPersonalizado', () => ({
  __esModule: true,
  default: () => <div>Simulador Personalizado Mock</div>
}));

jest.mock('../components/DecisionGuide', () => ({
  __esModule: true,
  default: () => <div>Asistente de Decisión Mock</div>
}));

// Mock para localStorage y matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    },
  });
});

describe('Dashboard Component', () => {
  const renderWithTheme = () => {
    return render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza correctamente con la pestaña de gráficos activa por defecto', async () => {
    renderWithTheme();

    // Esperar a que se cargue el contenido
    await waitFor(() => {
      expect(screen.getByText('Gráficos Comparativos Mock')).toBeInTheDocument();
    });

    // Verificar que el título está presente
    expect(screen.getByText('Dashboard Comparativo de Energía')).toBeInTheDocument();
  });

  test('cambia a la pestaña del simulador cuando se hace clic en el botón correspondiente', async () => {
    renderWithTheme();

    // Esperar a que se cargue el dashboard
    await waitFor(() => {
      expect(screen.getByText('Gráficos Comparativos Mock')).toBeInTheDocument();
    });

    // Cambiar a la pestaña del simulador
    const simuladorTab = screen.getByRole('tab', { name: /Simulador Personalizado/i });
    fireEvent.click(simuladorTab);

    // Verificar que se muestra el contenido del simulador
    await waitFor(() => {
      expect(screen.getByText('Simulador Personalizado Mock')).toBeInTheDocument();
    });
  });

  test('cambia a la pestaña del asistente de decisión cuando se hace clic en el botón correspondiente', async () => {
    renderWithTheme();

    // Esperar a que se cargue el dashboard
    await waitFor(() => {
      expect(screen.getByText('Gráficos Comparativos Mock')).toBeInTheDocument();
    });

    // Cambiar a la pestaña del asistente
    const decisionTab = screen.getByRole('tab', { name: /Asistente de Decisión/i });
    fireEvent.click(decisionTab);

    // Verificar que se muestra el contenido del asistente
    await waitFor(() => {
      expect(screen.getByText('Asistente de Decisión Mock')).toBeInTheDocument();
    });
  });

  test('cambia el tema correctamente', async () => {
    renderWithTheme();

    // Esperar a que se cargue el dashboard
    await waitFor(() => {
      expect(screen.getByText('Dashboard Comparativo de Energía')).toBeInTheDocument();
    });

    // El botón de tema debe estar presente
    const themeButton = screen.getByRole('button', { name: /Cambiar tema/i });
    expect(themeButton).toBeInTheDocument();

    // Cambiar el tema
    act(() => {
      fireEvent.click(themeButton);
    });

    // Verificar que el tema ha cambiado (comprobando el emoji)
    expect(themeButton).toHaveTextContent('🌞');
  });

  test('el skip link está presente y funciona', async () => {
    renderWithTheme();

    const skipLink = screen.getByText('Saltar al contenido principal');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');

    // El contenido principal debe tener el id correcto
    await waitFor(() => {
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveAttribute('id', 'main-content');
    });
  });
});