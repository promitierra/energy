import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DecisionGuide from '../components/DecisionGuide';
import ThemeProvider from '../theme/ThemeProvider';

describe('DecisionGuide Component', () => {
  const renderWithTheme = () => {
    return render(
      <ThemeProvider>
        <DecisionGuide />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza correctamente la pantalla inicial', async () => {
    renderWithTheme();

    // Verificar el título y descripción inicial
    expect(screen.getByText('Asistente de Toma de Decisiones')).toBeInTheDocument();
    expect(screen.getByText(/Este asistente te ayudará/)).toBeInTheDocument();
    
    // Verificar el botón de inicio
    const startButton = screen.getByRole('button', { name: /Iniciar Asistente/i });
    expect(startButton).toBeInTheDocument();
  });

  test('muestra el primer paso al hacer clic en Iniciar', async () => {
    renderWithTheme();
    
    // Hacer clic en el botón de inicio
    const startButton = screen.getByRole('button', { name: /Iniciar Asistente/i });
    fireEvent.click(startButton);

    // Verificar que aparece el primer paso
    await waitFor(() => {
      expect(screen.getByText('Horizonte de inversión')).toBeInTheDocument();
      expect(screen.getByText('¿Cuánto tiempo planeas vivir en tu hogar actual?')).toBeInTheDocument();
    });
  });

  test('permite navegar entre pasos', async () => {
    renderWithTheme();
    
    // Iniciar el asistente
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Asistente/i }));
    
    // Esperar al primer paso
    await waitFor(() => {
      expect(screen.getByText('Horizonte de inversión')).toBeInTheDocument();
    });

    // Seleccionar una opción
    fireEvent.click(screen.getByText('Más de 10 años'));
    
    // Verificar que avanza al siguiente paso
    await waitFor(() => {
      expect(screen.getByText('Presupuesto inicial')).toBeInTheDocument();
    });
  });

  test('muestra recomendación final al completar todos los pasos', async () => {
    renderWithTheme();
    
    // Iniciar el asistente
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Asistente/i }));
    
    // Completar todos los pasos
    await waitFor(() => {
      fireEvent.click(screen.getByText('Más de 10 años'));
    });
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Más de $10,000'));
    });
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Alta'));
    });

    // Verificar que muestra una recomendación
    await waitFor(() => {
      expect(screen.getByText(/Recomendación:/)).toBeInTheDocument();
    });
  });

  test('mantiene el estado de las respuestas seleccionadas', async () => {
    renderWithTheme();
    
    // Iniciar y completar pasos
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Asistente/i }));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Más de 10 años'));
    });
    
    // Verificar que la selección se mantiene
    const seleccion = screen.getByText('Más de 10 años');
    expect(seleccion).toHaveAttribute('aria-selected', 'true');
  });
});