import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renderiza el dashboard energético', async () => {
  render(<App />);
  
  // Inicialmente debería mostrar el loading
  expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  
  // Esperar a que cargue el contenido principal
  await screen.findByText(/dashboard energético/i, {}, { timeout: 3000 });
  
  // Verificar que se ha cargado el contenido principal
  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('main')).toBeInTheDocument();
});
