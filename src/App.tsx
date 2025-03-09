import React, { lazy, Suspense } from 'react';
import './App.css';
import { ThemeProvider } from './theme/ThemeProvider';

// Lazy loading de componentes principales
const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        </div>
      }>
        <Dashboard />
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
