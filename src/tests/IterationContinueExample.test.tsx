import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import IterationContinueExample from '../components/IterationContinueExample';
import { vi } from 'vitest';

describe('IterationContinueExample', () => {
  it('muestra el diálogo de confirmación al hacer clic en el botón', () => {
    render(<IterationContinueExample />);
    
    // Verificar que el diálogo no esté visible inicialmente
    expect(screen.queryByText('¿Desea continuar con la iteración?')).not.toBeInTheDocument();
    
    // Hacer clic en el botón para mostrar el diálogo
    fireEvent.click(screen.getByText('Iniciar siguiente iteración'));
    
    // Verificar que el diálogo está visible ahora
    expect(screen.getByText('¿Desea continuar con la iteración?')).toBeInTheDocument();
    expect(screen.getByText('Confirmación de iteración')).toBeInTheDocument();
  });

  it('cierra el diálogo al hacer clic en "Continuar"', () => {
    // Mock para console.log
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(<IterationContinueExample />);
    
    // Mostrar el diálogo
    fireEvent.click(screen.getByText('Iniciar siguiente iteración'));
    
    // Hacer clic en "Continuar"
    fireEvent.click(screen.getByText('Continuar'));
    
    // Verificar que el diálogo ya no está visible
    expect(screen.queryByText('¿Desea continuar con la iteración?')).not.toBeInTheDocument();
    
    // Verificar que se llamó a la función correcta
    expect(consoleSpy).toHaveBeenCalledWith('Continuando con la iteración...');
    
    consoleSpy.mockRestore();
  });

  it('cierra el diálogo al hacer clic en "Cancelar"', () => {
    // Mock para console.log
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(<IterationContinueExample />);
    
    // Mostrar el diálogo
    fireEvent.click(screen.getByText('Iniciar siguiente iteración'));
    
    // Hacer clic en "Cancelar"
    fireEvent.click(screen.getByText('Cancelar'));
    
    // Verificar que el diálogo ya no está visible
    expect(screen.queryByText('¿Desea continuar con la iteración?')).not.toBeInTheDocument();
    
    // Verificar que se llamó a la función correcta
    expect(consoleSpy).toHaveBeenCalledWith('Iteración cancelada');
    
    consoleSpy.mockRestore();
  });
});