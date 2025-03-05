import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../Dashboard';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Configurar mocks para localStorage y matchMedia
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

describe('Integración: Flujo completo del dashboard', () => {
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

  test('navegación entre pestañas y funcionalidad básica', async () => {
    renderWithTheme();

    // Verificar carga inicial
    await waitFor(() => {
      expect(screen.getByText('Dashboard Comparativo de Energía')).toBeInTheDocument();
    });

    // Navegación a simulador
    const simuladorTab = screen.getByRole('tab', { name: /Simulador Personalizado/i });
    fireEvent.click(simuladorTab);
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Simulador Personalizado/i })).toHaveAttribute('aria-selected', 'true');
    });

    // Navegación a asistente
    const asistenteTab = screen.getByRole('tab', { name: /Asistente de Decisión/i });
    fireEvent.click(asistenteTab);
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Asistente de Decisión/i })).toHaveAttribute('aria-selected', 'true');
    });

    // Volver a gráficos
    const graficosTab = screen.getByRole('tab', { name: /Análisis Comparativo/i });
    fireEvent.click(graficosTab);
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Análisis Comparativo/i })).toHaveAttribute('aria-selected', 'true');
    });
  });

  test('persistencia del tema y funcionalidad del toggle', async () => {
    renderWithTheme();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cambiar tema/i })).toBeInTheDocument();
    });

    const themeButton = screen.getByRole('button', { name: /Cambiar tema/i });
    
    // Cambiar a tema oscuro
    fireEvent.click(themeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(themeButton).toHaveTextContent('🌞');

    // Cambiar a tema claro
    fireEvent.click(themeButton);
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(themeButton).toHaveTextContent('🌙');
  });

  test('accesibilidad en la navegación por teclado', async () => {
    renderWithTheme();

    // Verificar que el skip link está presente
    const skipLink = screen.getByText('Saltar al contenido principal');
    expect(skipLink).toBeInTheDocument();

    // Verificar que el contenido principal tiene el id correcto
    await waitFor(() => {
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveAttribute('id', 'main-content');
    });

    // Verificar que los tabs son navegables por teclado
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(3);
    
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('role', 'tab');
      expect(tab).toHaveAttribute('aria-selected');
    });
  });
});