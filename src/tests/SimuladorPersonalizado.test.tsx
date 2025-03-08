import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimuladorPersonalizado from '../components/SimuladorPersonalizado';
import { ThemeProvider } from '../theme/ThemeProvider';

describe('SimuladorPersonalizado', () => {
  const renderComponent = () => {
    render(
      <ThemeProvider>
        <SimuladorPersonalizado />
      </ThemeProvider>
    );
  };

  const llenarFormulario = (datos = {}) => {
    const valoresPorDefecto = {
      'input-consumo-mensual': '250',
      'input-precio-electricidad': '454',
      'input-horas-sol': '5',
      'input-inversion-inicial': '9500000'
    };

    const valores = { ...valoresPorDefecto, ...datos };
    
    Object.entries(valores).forEach(([testId, valor]) => {
      const input = screen.getByTestId(testId);
      fireEvent.change(input, { target: { value: valor } });
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validación de campos', () => {
    test('muestra error cuando el consumo es inválido', async () => {
      renderComponent();
      const input = screen.getByTestId('input-consumo-mensual');
      
      fireEvent.change(input, { target: { value: '-100' } });
      expect(await screen.findByText(/el consumo debe estar entre 0 y 5000 kwh/i)).toBeInTheDocument();
      
      fireEvent.change(input, { target: { value: '6000' } });
      expect(await screen.findByText(/el consumo debe estar entre 0 y 5000 kwh/i)).toBeInTheDocument();
    });

    test('muestra error cuando la tarifa es inválida', async () => {
      renderComponent();
      const input = screen.getByTestId('input-precio-electricidad');
      
      fireEvent.change(input, { target: { value: '100' } });
      expect(await screen.findByText(/la tarifa debe estar entre 300 y 1000 cop\/kwh/i)).toBeInTheDocument();
      
      fireEvent.change(input, { target: { value: '1200' } });
      expect(await screen.findByText(/la tarifa debe estar entre 300 y 1000 cop\/kwh/i)).toBeInTheDocument();
    });

    test('muestra error cuando las horas de sol son inválidas', async () => {
      renderComponent();
      const input = screen.getByTestId('input-horas-sol');
      
      fireEvent.change(input, { target: { value: '-1' } });
      expect(await screen.findByText(/las horas de sol deben estar entre 0 y 12/i)).toBeInTheDocument();
      
      fireEvent.change(input, { target: { value: '15' } });
      expect(await screen.findByText(/las horas de sol deben estar entre 0 y 12/i)).toBeInTheDocument();
    });

    test('muestra error cuando la inversión es inválida', async () => {
      renderComponent();
      const input = screen.getByTestId('input-inversion-inicial');
      
      fireEvent.change(input, { target: { value: '-1000000' } });
      expect(await screen.findByText(/la inversión no puede ser negativa/i)).toBeInTheDocument();
    });
  });

  describe('Cálculos y resultados', () => {
    test('calcula correctamente con datos válidos', async () => {
      renderComponent();
      llenarFormulario();
      
      const btnCalcular = screen.getByTestId('btn-calcular');
      fireEvent.click(btnCalcular);

      await waitFor(() => {
        const resultado = screen.getByTestId('resultado-calculo');
        expect(resultado).toBeInTheDocument();
        expect(resultado).toHaveTextContent(/ahorro mensual estimado/i);
        expect(resultado).toHaveTextContent(/tiempo de recuperación de inversión/i);
      });
    });

    test('maneja casos límite en los cálculos', async () => {
      renderComponent();
      
      // Caso límite: valores mínimos permitidos
      llenarFormulario({
        'input-consumo-mensual': '1',
        'input-precio-electricidad': '300',
        'input-horas-sol': '1',
        'input-inversion-inicial': '1000000'
      });
      
      const btnCalcular = screen.getByTestId('btn-calcular');
      fireEvent.click(btnCalcular);

      await waitFor(() => {
        expect(screen.getByTestId('resultado-calculo')).toBeInTheDocument();
      });

      // Caso límite: valores máximos permitidos
      llenarFormulario({
        'input-consumo-mensual': '5000',
        'input-precio-electricidad': '1000',
        'input-horas-sol': '12',
        'input-inversion-inicial': '100000000'
      });
      
      fireEvent.click(btnCalcular);

      await waitFor(() => {
        expect(screen.getByTestId('resultado-calculo')).toBeInTheDocument();
      });
    });
  });

  describe('Interfaz y accesibilidad', () => {
    test('reinicia correctamente el formulario', async () => {
      renderComponent();
      llenarFormulario();
      
      const btnReiniciar = screen.getByTestId('btn-reiniciar');
      fireEvent.click(btnReiniciar);
      
      const inputIds = [
        'input-consumo-mensual',
        'input-precio-electricidad',
        'input-horas-sol',
        'input-inversion-inicial'
      ];
      
      inputIds.forEach(id => {
        expect(screen.getByTestId(id)).toHaveValue(null);
      });

      expect(screen.queryByTestId('resultado-calculo')).not.toBeInTheDocument();
    });

    test('tiene campos accesibles con descripciones y validación ARIA', async () => {
      renderComponent();
      
      const input = screen.getByTestId('input-consumo-mensual');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('hint'));
      
      fireEvent.change(input, { target: { value: '-100' } });
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
        const error = screen.getByText(/el consumo debe estar entre 0 y 5000 kwh/i);
        expect(error).toHaveAttribute('role', 'alert');
      });
    });

    test('enfoca los resultados después de calcular', async () => {
      renderComponent();
      llenarFormulario();
      
      const btnCalcular = screen.getByTestId('btn-calcular');
      fireEvent.click(btnCalcular);

      await waitFor(() => {
        const resultados = screen.getByTestId('resultado-calculo');
        expect(resultados).toHaveFocus();
      });
    });
  });
});