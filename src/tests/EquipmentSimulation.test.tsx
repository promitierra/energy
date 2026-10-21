import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SimuladorPersonalizado from '../components/SimuladorPersonalizado';
function setup() {
  render(<SimuladorPersonalizado />);
  for (const [id, value] of Object.entries({ 'input-consumo-mensual': '250', 'input-precio-electricidad': '454', 'input-horas-sol': '5', 'input-inversion-inicial': '9500000' })) fireEvent.change(screen.getByTestId(id), { target: { value } });
}
const calculate = () => fireEvent.click(screen.getByTestId('btn-calcular'));
describe('equipment simulator integration', () => {
  it('keeps results frozen after edits and recalculates equipment changes', () => {
    setup(); calculate();
    const result = screen.getByTestId('resultado-calculo');
    expect(result).toHaveTextContent('247,68');
    fireEvent.change(screen.getByLabelText('Cantidad de paneles'), { target: { value: '0' } });
    fireEvent.change(screen.getByTestId('input-consumo-mensual'), { target: { value: '100' } });
    expect(within(result).getByRole('status')).toHaveTextContent('Datos modificados');
    expect(result).toHaveTextContent('Consumo: 250'); expect(result).toHaveTextContent('247,68');
    calculate(); expect(result).toHaveTextContent('Consumo: 100'); expect(result).toHaveTextContent('Sin recuperación');
  });
  it('adds and removes descriptive equipment features', () => {
    setup(); fireEvent.click(screen.getByRole('button', { name: 'Añadir característica de panel' }));
    fireEvent.change(screen.getByLabelText('Característica 1 de panel'), { target: { value: 'Voc' } });
    fireEvent.change(screen.getByLabelText('Valor 1 de panel'), { target: { value: '48 V' } });
    calculate(); expect(screen.getByTestId('resultado-calculo')).toHaveTextContent('247,68');
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar característica 1 de panel' }));
    expect(screen.queryByLabelText('Característica 1 de panel')).not.toBeInTheDocument();
  });
  it('rejects cleared numeric equipment values and accepts retyping', () => {
    setup(); const count = screen.getByLabelText('Cantidad de paneles');
    fireEvent.change(count, { target: { value: '' } }); calculate();
    expect(screen.queryByTestId('resultado-calculo')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Cantidad de paneles');
    fireEvent.change(count, { target: { value: '5' } }); calculate();
    expect(screen.getByTestId('resultado-calculo')).toBeInTheDocument();
  });
  it('includes storage and resets all equipment', () => {
    setup(); fireEvent.click(screen.getByLabelText('Incluir almacenamiento')); calculate();
    const result = screen.getByTestId('resultado-calculo');
    const nominal = within(result).getByRole('row', { name: /Capacidad nominal de baterías/ });
    expect(nominal).toHaveTextContent('5');
    fireEvent.click(screen.getByTestId('btn-reiniciar'));
    expect(screen.getByLabelText('Incluir almacenamiento')).not.toBeChecked();
    expect(screen.getByLabelText('Cantidad de paneles')).toHaveValue(5);
  });
});
