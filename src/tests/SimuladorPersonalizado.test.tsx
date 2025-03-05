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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('muestra error cuando el consumo es inválido', async () => {
    renderComponent();
    const input = screen.getByLabelText(/consumo mensual/i);
    
    fireEvent.change(input, { target: { value: '-100' } });
    expect(await screen.findByText(/el consumo debe estar entre 0 y 5000 kwh/i)).toBeInTheDocument();
  });

  test('muestra error cuando la tarifa es inválida', async () => {
    renderComponent();
    const input = screen.getByLabelText(/tarifa de energía/i);
    
    fireEvent.change(input, { target: { value: '100' } });
    expect(await screen.findByText(/la tarifa debe estar entre 300 y 1000 cop\/kwh/i)).toBeInTheDocument();
  });

  test('calcula correctamente con datos válidos', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByLabelText(/consumo mensual/i), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText(/tarifa de energía/i), { target: { value: '454' } });
    fireEvent.change(screen.getByLabelText(/horas de sol/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/inversión inicial/i), { target: { value: '9500000' } });
    
    fireEvent.click(screen.getByRole('button', { name: /calcular/i }));

    await waitFor(() => {
      expect(screen.getByTestId('resultado-calculo')).toBeInTheDocument();
    });
  });

  test('reinicia correctamente el formulario', () => {
    renderComponent();
    
    fireEvent.change(screen.getByLabelText(/consumo mensual/i), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText(/tarifa de energía/i), { target: { value: '454' } });
    
    fireEvent.click(screen.getByRole('button', { name: /reiniciar/i }));
    
    expect(screen.getByLabelText(/consumo mensual/i)).toHaveValue(null);
    expect(screen.getByLabelText(/tarifa de energía/i)).toHaveValue(null);
  });

  test('tiene campos accesibles con descripciones', async () => {
    renderComponent();
    
    expect(screen.getByLabelText(/consumo mensual/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tarifa de energía/i)).toBeInTheDocument();
    expect(screen.getByText(/el consumo mensual típico de un hogar/i)).toBeInTheDocument();
    
    const input = screen.getByLabelText(/consumo mensual/i);
    fireEvent.change(input, { target: { value: '-100' } });
    
    const error = await screen.findByText(/el consumo debe estar entre 0 y 5000 kwh/i);
    expect(error).toHaveAttribute('id', 'consumo-error');
    expect(input).toHaveAttribute('aria-describedby', 'consumo-error');
  });
});