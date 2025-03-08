import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContinueDialog from '../../../components/ui/ContinueDialog';
import { ThemeProvider } from '../../../theme/ThemeProvider';

describe('ContinueDialog Component', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    title: "¿Confirmar selección?",
    description: "¿Está seguro de que desea guardar esta selección y continuar?",
    confirmLabel: "Confirmar",
    cancelLabel: "Revisar"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza correctamente con textos por defecto en español', () => {
    render(
      <ThemeProvider>
        <ContinueDialog {...defaultProps} />
      </ThemeProvider>
    );
    
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: defaultProps.confirmLabel })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: defaultProps.cancelLabel })).toBeInTheDocument();
  });

  it('renderiza con textos personalizados cuando se proporcionan', () => {
    const customProps = {
      ...defaultProps,
      title: "Título personalizado",
      description: "Descripción personalizada",
      confirmLabel: "Sí",
      cancelLabel: "No"
    };

    render(
      <ThemeProvider>
        <ContinueDialog {...customProps} />
      </ThemeProvider>
    );

    expect(screen.getByText("Título personalizado")).toBeInTheDocument();
    expect(screen.getByText("Descripción personalizada")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Sí" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "No" })).toBeInTheDocument();
  });

  it('no renderiza nada cuando isOpen es false', () => {
    render(
      <ThemeProvider>
        <ContinueDialog {...defaultProps} isOpen={false} />
      </ThemeProvider>
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('llama a onConfirm cuando se presiona Enter', () => {
    render(
      <ThemeProvider>
        <ContinueDialog {...defaultProps} />
      </ThemeProvider>
    );
    
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter' });
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('llama a onCancel cuando se presiona Escape', () => {
    render(
      <ThemeProvider>
        <ContinueDialog {...defaultProps} />
      </ThemeProvider>
    );
    
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('enfoca el botón de confirmar al abrir el diálogo', () => {
    render(
      <ThemeProvider>
        <ContinueDialog {...defaultProps} />
      </ThemeProvider>
    );
    
    expect(screen.getByRole('button', { name: defaultProps.confirmLabel })).toHaveFocus();
  });

  it('has correct ARIA attributes for accessibility', () => {
    render(
      <ThemeProvider>
        <ContinueDialog {...defaultProps} />
      </ThemeProvider>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('maneja eventos de teclado', () => {
    render(
      <ThemeProvider>
        <ContinueDialog {...defaultProps} />
      </ThemeProvider>
    );

    const confirmButton = screen.getByRole('button', { name: defaultProps.confirmLabel });
    fireEvent.keyDown(confirmButton, { key: 'Enter' });
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);

    const cancelButton = screen.getByRole('button', { name: defaultProps.cancelLabel });
    fireEvent.keyDown(cancelButton, { key: 'Space' });
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('es accesible mediante teclado', () => {
    render(
      <ThemeProvider>
        <ContinueDialog {...defaultProps} />
      </ThemeProvider>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});