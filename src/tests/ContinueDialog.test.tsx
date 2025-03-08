import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContinueDialog from '../components/ui/ContinueDialog';
import { ThemeProvider } from '../theme/ThemeProvider';

describe('ContinueDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: "¿Continuar?",
    description: "¿Desea continuar con la iteración?",
    confirmLabel: "Continuar",
    cancelLabel: "Cancelar",
    onConfirm: jest.fn(),
    onCancel: jest.fn()
  };

  const renderWithTheme = (props = defaultProps) => {
    return render(
      <ThemeProvider>
        <ContinueDialog {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza correctamente cuando está abierto', () => {
    renderWithTheme();
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.confirmLabel)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.cancelLabel)).toBeInTheDocument();
  });

  it('no renderiza cuando está cerrado', () => {
    renderWithTheme({ ...defaultProps, isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('maneja clics en los botones correctamente', () => {
    renderWithTheme();
    
    // Probar botón confirmar
    fireEvent.click(screen.getByText(defaultProps.confirmLabel));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    
    // Probar botón cancelar
    fireEvent.click(screen.getByText(defaultProps.cancelLabel));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('maneja eventos de teclado', () => {
    renderWithTheme();
    
    // Probar Enter en botón confirmar
    const confirmButton = screen.getByText(defaultProps.confirmLabel);
    fireEvent.keyDown(confirmButton, { key: 'Enter' });
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    
    // Probar Space en botón cancelar
    const cancelButton = screen.getByText(defaultProps.cancelLabel);
    fireEvent.keyDown(cancelButton, { key: ' ' });
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    
    // Probar Escape
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(2);
  });

  it('es accesible mediante teclado', () => {
    renderWithTheme();
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
    
    const confirmButton = screen.getByText(defaultProps.confirmLabel);
    const cancelButton = screen.getByText(defaultProps.cancelLabel);
    
    expect(confirmButton).toHaveAttribute('type', 'button');
    expect(cancelButton).toHaveAttribute('type', 'button');
  });
});