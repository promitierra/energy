import React from 'react';
import { render, screen } from '@testing-library/react';
import SkipLink from '../../../components/ui/skip-link';

describe('SkipLink', () => {
  it('renders with default text', () => {
    render(<SkipLink targetId="main-content" />);
    
    expect(screen.getByText('Saltar al contenido principal')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '#main-content');
  });

  it('renders with custom text', () => {
    const customText = 'Ir al contenido';
    render(<SkipLink targetId="main-content" text={customText} />);
    
    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  it('has correct aria attributes and styling for accessibility', () => {
    render(<SkipLink targetId="test-id" />);
    
    const link = screen.getByRole('link');
    
    // Verificar que el enlace apunta al id correcto
    expect(link).toHaveAttribute('href', '#test-id');
    
    // Verificar que tiene las clases para ser oculto visualmente y mostrarse al enfocar
    expect(link).toHaveClass('absolute');
    expect(link).toHaveClass('-translate-y-full');
    expect(link).toHaveClass('focus:translate-y-0');
  });
});