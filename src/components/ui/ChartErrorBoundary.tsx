import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  chartName: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ChartErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Actualiza el estado para que el siguiente render muestre la UI alternativa
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error(`Chart Error in ${this.props.chartName}:`, error, errorInfo);
    this.setState({ errorInfo });
    
    // Enviar el error a un servicio de analítica o logging
    if (window.gtag) {
      window.gtag('event', 'chart_error', {
        'event_category': 'error',
        'event_label': this.props.chartName,
        'value': error.message
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Puedes renderizar cualquier UI alternativa
      const defaultFallback = (
        <Card className="w-full bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                role="img"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <span>Error en el gráfico {this.props.chartName}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-red-600 dark:text-red-300" role="alert" aria-live="assertive">
                Ha ocurrido un error al cargar este gráfico.
              </p>
              <div className="text-sm text-red-500 dark:text-red-300">
                <details className="cursor-pointer">
                  <summary className="focus:outline-none focus:underline">
                    Ver detalles técnicos
                  </summary>
                  <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-800">
                    <p className="font-mono text-xs break-words">
                      {this.state.error && this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="mt-2 max-h-40 overflow-auto font-mono text-xs p-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              </div>
              <div className="mt-4">
                <button
                  onClick={this.handleReset}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="Reintentar cargar el gráfico"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      );

      return this.props.fallback || defaultFallback;
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;