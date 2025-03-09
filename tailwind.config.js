/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilitamos el modo oscuro basado en clases
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados para la aplicación
        'energy-blue': {
          50: '#ebf5ff',
          100: '#e1effe',
          200: '#c3ddfd',
          300: '#a4cafe',
          400: '#76a9fa',
          500: '#4f88f7',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'energy-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'energy-orange': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      }
    },
  },
  plugins: [],
}