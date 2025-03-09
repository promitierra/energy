import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';

// Test component
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
    window.__setPrefersDarkMode(false);
  });

  test('debe establecer el tema light por defecto', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  test('debe cargar el tema desde localStorage si está disponible', () => {
    window.localStorage.setItem('theme', 'dark');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('debe cambiar entre temas cuando se llama a toggleTheme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const toggleButton = screen.getByText('Toggle Theme');
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    
    // Cambiar a dark
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem('theme')).toBe('dark');
    
    // Cambiar de nuevo a light
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(window.localStorage.getItem('theme')).toBe('light');
  });

  test('debe usar el tema del sistema si está disponible y no hay preferencia guardada', () => {
    window.__setPrefersDarkMode(true);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('debe lanzar un error si useTheme se usa fuera de ThemeProvider', () => {
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleErrorMock.mockRestore();
  });
});