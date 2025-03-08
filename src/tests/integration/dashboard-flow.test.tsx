import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../Dashboard';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Mocks más descriptivos con testids para mejores aserciones
jest.mock('../../graficos-comparativos', () => () => (
  <div data-testid="graficos-content" role="region" aria-label="Análisis Comparativo">
    Análisis Comparativo
  </div>
));

jest.mock('../../components/SimuladorPersonalizado', () => () => (
  <div data-testid="simulador-content" role="region" aria-label="Simulador Personalizado">
    Simulador Personalizado
  </div>
));

jest.mock('../../components/DecisionGuide', () => () => (
  <div data-testid="decision-content" role="region" aria-label="Asistente de Decisión">
    Asistente de Decisión
  </div>
));

describe('Dashboard Integration Flow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  const renderDashboard = () => {
    return render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );
  };

  it('flujo completo de navegación entre pestañas', async () => {
    renderDashboard();

    // Verificar estado inicial
    await waitFor(() => {
      expect(screen.getByTestId('graficos-content')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /análisis comparativo/i })).toHaveAttribute('aria-selected', 'true');
    });

    // Cambiar a simulador
    const simuladorTab = screen.getByRole('tab', { name: /simulador personalizado/i });
    fireEvent.click(simuladorTab);

    await waitFor(() => {
      expect(screen.getByTestId('simulador-content')).toBeInTheDocument();
      expect(simuladorTab).toHaveAttribute('aria-selected', 'true');
      expect(window.localStorage.getItem('activeTab')).toBe('simulador');
    });

    // Cambiar a asistente
    const decisionTab = screen.getByRole('tab', { name: /asistente de decisión/i });
    fireEvent.click(decisionTab);

    await waitFor(() => {
      expect(screen.getByTestId('decision-content')).toBeInTheDocument();
      expect(decisionTab).toHaveAttribute('aria-selected', 'true');
      expect(window.localStorage.getItem('activeTab')).toBe('decision');
    });
  });

  it('persiste la pestaña activa entre recargas', async () => {
    // Simular pestaña guardada
    window.localStorage.setItem('activeTab', 'simulador');
    
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId('simulador-content')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /simulador personalizado/i }))
        .toHaveAttribute('aria-selected', 'true');
    });
  });

  it('manejo del tema oscuro/claro', async () => {
    renderDashboard();

    // Verificar tema inicial
    expect(document.documentElement.classList.contains('light')).toBe(true);

    // Cambiar a tema oscuro
    const themeButton = screen.getByRole('button', { name: /cambiar a tema oscuro/i });
    fireEvent.click(themeButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(window.localStorage.getItem('theme')).toBe('dark');
    });

    // Cambiar a tema claro
    const lightButton = screen.getByRole('button', { name: /cambiar a tema claro/i });
    fireEvent.click(lightButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(window.localStorage.getItem('theme')).toBe('light');
    });
  });
});