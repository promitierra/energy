import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import DecisionGuide from '../components/DecisionGuide';
import { ThemeProvider } from '../theme/ThemeProvider';

describe('DecisionGuide Component', () => {
  const renderWithTheme = () => {
    return render(
      <ThemeProvider>
        <DecisionGuide />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Pantalla inicial', () => {
    test('renderiza correctamente la pantalla inicial', async () => {
      renderWithTheme();
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /asistente de toma de decisiones/i })).toBeInTheDocument();
        expect(screen.getByText(/te ayudamos a elegir la mejor alternativa energética/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar el asistente de decisión/i })).toBeEnabled();
      });
    });

    test('persiste el estado del asistente', async () => {
      // Simular estado guardado
      window.localStorage.setItem('decisionGuideState', JSON.stringify({
        currentStep: 2,
        answers: ['300-500', 'menos-5m']
      }));

      renderWithTheme();

      await waitFor(() => {
        expect(screen.getByText(/¿cuál es su presupuesto disponible/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navegación entre pasos', () => {
    const avanzarPaso = async () => {
      const radioInputs = await screen.findAllByRole('radio');
      fireEvent.click(radioInputs[0]);
      
      const confirmButton = await screen.findByRole('button', { name: /continuar/i });
      fireEvent.click(confirmButton);
    };

    test('permite navegar hacia adelante y atrás', async () => {
      renderWithTheme();
      
      // Iniciar asistente
      fireEvent.click(screen.getByRole('button', { name: /iniciar el asistente de decisión/i }));
      
      // Verificar primer paso
      await waitFor(() => {
        expect(screen.getByText(/¿cuál es su consumo mensual promedio/i)).toBeInTheDocument();
      });

      // Avanzar al segundo paso
      await avanzarPaso();

      // Verificar segundo paso
      await waitFor(() => {
        expect(screen.getByText(/¿cuál es su presupuesto disponible/i)).toBeInTheDocument();
      });

      // Retroceder al primer paso
      fireEvent.click(screen.getByRole('button', { name: /anterior/i }));

      await waitFor(() => {
        expect(screen.getByText(/¿cuál es su consumo mensual promedio/i)).toBeInTheDocument();
      });
    });

    test('mantiene las respuestas al navegar entre pasos', async () => {
      renderWithTheme();
      
      // Iniciar y responder primera pregunta
      fireEvent.click(screen.getByRole('button', { name: /iniciar el asistente de decisión/i }));
      await avanzarPaso();
      
      // Ir al paso anterior y verificar que la respuesta se mantiene
      fireEvent.click(screen.getByRole('button', { name: /anterior/i }));
      
      await waitFor(() => {
        const radioGroup = screen.getByRole('radiogroup');
        const selectedOption = within(radioGroup).getByRole('radio', { checked: true });
        expect(selectedOption).toBeInTheDocument();
      });
    });
  });

  describe('Validación y manejo de errores', () => {
    test('requiere selección antes de continuar', async () => {
      renderWithTheme();
      
      // Iniciar asistente
      fireEvent.click(screen.getByRole('button', { name: /iniciar el asistente de decisión/i }));
      
      // Intentar continuar sin selección
      const confirmButton = await screen.findByRole('button', { name: /continuar/i });
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/por favor seleccione una opción/i)).toBeInTheDocument();
      });
    });

    test('maneja errores de carga de estado', async () => {
      // Simular estado inválido
      window.localStorage.setItem('decisionGuideState', 'invalid-json');
      
      renderWithTheme();
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /asistente de toma de decisiones/i })).toBeInTheDocument();
      });
    });
  });

  describe('Resultados y reinicio', () => {
    const completarPreguntas = async () => {
      // Iniciar asistente
      fireEvent.click(screen.getByRole('button', { name: /iniciar el asistente de decisión/i }));

      // Responder todas las preguntas
      for (let i = 0; i < 7; i++) {
        const radioInputs = await screen.findAllByRole('radio');
        fireEvent.click(radioInputs[0]);
        
        const confirmButton = await screen.findByRole('button', { name: /continuar/i });
        fireEvent.click(confirmButton);
        
        // Esperar a que se muestre la siguiente pregunta o resultados
        await waitFor(() => {
          const nextQuestionOrResults = screen.queryByText(/pregunta/i) || screen.queryByText(/resultados/i);
          expect(nextQuestionOrResults).toBeInTheDocument();
        });
      }
    };

    test('muestra resultados con todas las secciones necesarias', async () => {
      renderWithTheme();
      await completarPreguntas();
      
      await waitFor(() => {
        expect(screen.getByText(/resultados de tu evaluación personalizada/i)).toBeInTheDocument();
        expect(screen.getByText(/compatibilidad con tus necesidades/i)).toBeInTheDocument();
        expect(screen.getByText(/análisis por categorías/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /comenzar de nuevo/i })).toBeEnabled();
      });
    });

    test('permite reiniciar desde los resultados', async () => {
      renderWithTheme();
      await completarPreguntas();
      
      const restartButton = await screen.findByRole('button', { name: /comenzar de nuevo/i });
      fireEvent.click(restartButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /asistente de toma de decisiones/i })).toBeInTheDocument();
        expect(window.localStorage.getItem('decisionGuideState')).toBeNull();
      });
    });

    test('genera recomendaciones consistentes', async () => {
      renderWithTheme();
      await completarPreguntas();
      
      await waitFor(() => {
        const resultados = screen.getByTestId('resultados-evaluacion');
        expect(resultados).toHaveTextContent(/recomendación principal/i);
        expect(resultados).toHaveTextContent(/alternativas sugeridas/i);
      });
    });
  });
});