import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';
import ThemeProvider from '../theme/ThemeProvider';

jest.mock('../graficos-comparativos', () => () => <div data-testid="graficos-mock">Análisis Comparativo</div>);
jest.mock('../components/SimuladorPersonalizado', () => () => <div data-testid="simulador-mock">Simulador Personalizado</div>);
jest.mock('../components/DecisionGuide', () => () => <div data-testid="decision-mock">Asistente de Decisión</div>);

describe('Dashboard Component', () => {
  const renderWithTheme = () => {
    return render(
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    window.localStorage.clear();
    // Limpiar el hash de la URL
    window.history.replaceState(null, '', '#');
  });

  test('renderiza correctamente con la pestaña de gráficos activa por defecto', () => {
    renderWithTheme();
    
    // Verificar que el título está presente
    expect(screen.getByText('Dashboard Energético')).toBeInTheDocument();
    
    // Verificar que la pestaña de análisis comparativo está activa
    const graficosTab = screen.getByRole('tab', { name: /análisis comparativo/i });
    expect(graficosTab).toHaveAttribute('aria-selected', 'true');
    
    // Verificar que el contenido correspondiente se muestra
    expect(screen.getByRole('heading', { 
      name: /Análisis Comparativo de Alternativas Energéticas/i 
    })).toBeInTheDocument();
  });

  test('cambia a la pestaña del simulador cuando se hace clic en el botón correspondiente', async () => {
    renderWithTheme();

    // Hacer clic en la pestaña del simulador
    fireEvent.click(screen.getByRole('tab', { name: /simulador personalizado/i }));
    
    // Verificar que la pestaña está activa y el contenido se actualiza
    await waitFor(() => {
      const simuladorTab = screen.getByRole('tab', { name: /simulador personalizado/i });
      expect(simuladorTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('simulador-mock')).toBeInTheDocument();
    });
  });

  test('cambia a la pestaña del asistente cuando se hace clic en el botón correspondiente', async () => {
    renderWithTheme();

    // Hacer clic en la pestaña del asistente
    fireEvent.click(screen.getByRole('tab', { name: /asistente de decisión/i }));
    
    // Verificar que la pestaña está activa y el contenido se actualiza
    await waitFor(() => {
      const asistenteTab = screen.getByRole('tab', { name: /asistente de decisión/i });
      expect(asistenteTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText(/Asistente de Decisión/)).toBeInTheDocument();
    });
  });

  test('mantiene la pestaña activa después de recargar', async () => {
    // Configurar localStorage antes de renderizar
    window.localStorage.setItem('activeTab', 'simulador');
    
    // Forzar un re-render limpio
    const { unmount } = renderWithTheme();
    unmount();
    renderWithTheme();
    
    // Verificar que se carga la pestaña guardada
    await waitFor(() => {
      const simuladorTab = screen.getByRole('tab', { name: /simulador personalizado/i });
      expect(simuladorTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('simulador-mock')).toBeInTheDocument();
    });
  });

  test('cambia el tema correctamente', async () => {
    renderWithTheme();
    
    // Verificar tema inicial (claro)
    expect(document.documentElement.classList.contains('light')).toBe(true);
    
    // Cambiar a tema oscuro
    const themeButton = screen.getByRole('button', { name: /cambiar a tema oscuro/i });
    fireEvent.click(themeButton);
    
    // Verificar cambio a tema oscuro
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(screen.getByRole('button', { name: /cambiar a tema claro/i })).toBeInTheDocument();
    });
    
    // Volver a tema claro
    fireEvent.click(screen.getByRole('button', { name: /cambiar a tema claro/i }));
    
    // Verificar vuelta a tema claro
    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(screen.getByRole('button', { name: /cambiar a tema oscuro/i })).toBeInTheDocument();
    });
  });
});