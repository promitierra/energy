import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DecisionGuide from '../components/DecisionGuide';
import { ThemeProvider } from '../theme/ThemeProvider';

const renderGuide = () => render(<ThemeProvider><DecisionGuide /></ThemeProvider>);
const start = () => fireEvent.click(screen.getByRole('button', { name: /iniciar el asistente de decisión/i }));
const answer = (index = 0) => fireEvent.click(screen.getAllByRole('radio')[index]);
const finish = (firstQuestion = 1) => {
  for (let question = firstQuestion; question <= 7; question++) {
    expect(screen.getByRole('form', { name: `Pregunta ${question} de 7` })).toBeInTheDocument();
    answer();
  }
  return screen.getByRole('region', { name: 'Resultados del asistente' });
};
const compatibility = () => within(screen.getByRole('region', { name: 'Resultados del asistente' }))
  .getAllByText(/% de compatibilidad$/).map(item => item.textContent);

describe('DecisionGuide', () => {
  beforeEach(() => window.localStorage.clear());

  test('muestra la introducción y enfoca el botón de inicio', () => {
    renderGuide();
    expect(screen.getByRole('heading', { name: /asistente de toma de decisiones/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar el asistente de decisión/i })).toHaveFocus();
  });

  test('inicia una evaluación nueva al volver a montar el asistente', () => {
    const { unmount } = renderGuide();
    start();
    answer();
    expect(screen.getByRole('form', { name: 'Pregunta 2 de 7' })).toBeInTheDocument();
    unmount();
    renderGuide();
    start();
    expect(screen.getByRole('form', { name: 'Pregunta 1 de 7' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { checked: true })).not.toBeInTheDocument();
  });

  test('avanza automáticamente y permite volver a la pregunta anterior', () => {
    renderGuide();
    start();
    expect(screen.getByRole('heading', { name: /cuál es su consumo mensual promedio/i })).toBeInTheDocument();
    answer();
    expect(screen.getByRole('heading', { name: /cuál es su presupuesto inicial disponible/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /regresar a la pregunta anterior/i }));
    expect(screen.getByRole('form', { name: 'Pregunta 1 de 7' })).toBeInTheDocument();
  });

  test('conserva la selección al volver y permite avanzar sin cambiarla', () => {
    renderGuide();
    start();
    answer(1);
    fireEvent.click(screen.getByRole('button', { name: /regresar a la pregunta anterior/i }));
    expect(screen.getByRole('radio', { name: 'Medio (150-300 kWh)' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: /siguiente pregunta/i }));
    expect(screen.getByRole('form', { name: 'Pregunta 2 de 7' })).toBeInTheDocument();
  });

  test('impide continuar antes de elegir una respuesta', () => {
    renderGuide();
    start();
    const next = screen.getByRole('button', { name: /siguiente pregunta/i });
    expect(next).toBeDisabled();
    fireEvent.click(next);
    expect(screen.getByRole('form', { name: 'Pregunta 1 de 7' })).toBeInTheDocument();
  });

  test('permite cancelar y comenzar sin respuestas anteriores', () => {
    renderGuide();
    start();
    fireEvent.click(screen.getByRole('button', { name: /regresar al inicio/i }));
    start();
    expect(screen.queryByRole('radio', { checked: true })).not.toBeInTheDocument();
  });

  test('muestra resultados, gráficos accesibles y recomendación detallada', () => {
    renderGuide();
    start();
    const results = within(finish());
    for (const name of [/resultados de tu evaluación personalizada/i, /^compatibilidad con tus necesidades$/i,
      /^análisis por categorías$/i, /recomendación detallada/i, /ventajas principales/i, /consideraciones importantes/i]) {
      expect(results.getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(compatibility()).toHaveLength(3);
    expect(results.getByRole('button', { name: /ir al simulador/i })).toHaveAttribute('href', '#simulador');
  });

  test('reinicia las respuestas y reproduce los resultados para las mismas selecciones', () => {
    renderGuide();
    start();
    finish();
    const previous = compatibility();
    fireEvent.click(screen.getByRole('button', { name: /reiniciar el asistente/i }));
    start();
    expect(screen.queryByRole('radio', { checked: true })).not.toBeInTheDocument();
    finish();
    expect(compatibility()).toEqual(previous);
  });

  test('cambiar una respuesta anterior equivale a elegirla desde el principio', () => {
    const { unmount } = renderGuide();
    start();
    answer(1);
    finish(2);
    const expected = compatibility();
    unmount();
    renderGuide();
    start();
    answer(0);
    fireEvent.click(screen.getByRole('button', { name: /regresar a la pregunta anterior/i }));
    answer(1);
    finish(2);
    expect(compatibility()).toEqual(expected);
  });
});
