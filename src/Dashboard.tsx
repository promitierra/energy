import React, { lazy, Suspense, useState, useCallback, memo, useEffect } from 'react';
import { useTheme } from './theme/ThemeProvider';
import SkipLink from './components/ui/skip-link';
// Lazy loading para todos los componentes
const GraficosComparativos = lazy(() => import('./graficos-comparativos'));
const SimuladorPersonalizado = lazy(() => import('./components/SimuladorPersonalizado'));
const DecisionGuide = lazy(() => import('./components/DecisionGuide'));

// Componente de carga mejorado
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-[500px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando componentes avanzados...</p>
    </div>
  </div>
));

// Componente de tab mejorado con indicadores
const Tab = memo(({ tabId, isActive, onClick, children, icon }: {
  tabId: string;
  isActive: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  icon?: string;
}) => (
  <button
    id={`tab-${tabId}`}
    role="tab"
    aria-selected={isActive}
    tabIndex={isActive ? 0 : -1}
    aria-controls={`panel-${tabId}`}
    className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
      isActive 
        ? 'bg-blue-700 text-white shadow-md'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
    onClick={onClick}
  >
    {icon && <span className="text-lg" aria-hidden="true">{icon}</span>}
    <span>{children}</span>
  </button>
));

function Dashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    const validTabs = ['graficos', 'simulador', 'decision'];
    const hash = window.location.hash.replace('#', '');
    const savedTab = localStorage.getItem('activeTab');
    
    // Prioridad: hash URL > localStorage > default
    if (validTabs.includes(hash)) {
      localStorage.setItem('activeTab', hash);
      return hash;
    } else if (savedTab && validTabs.includes(savedTab)) {
      window.history.replaceState(null, '', `#${savedTab}`);
      return savedTab;
    }
    
    const defaultTab = 'graficos';
    localStorage.setItem('activeTab', defaultTab);
    window.history.replaceState(null, '', `#${defaultTab}`);
    return defaultTab;
  });

  // Sincronizar estado cuando cambia externamente
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | null) => {
      const newValue = e ? e.newValue : localStorage.getItem('activeTab');
      if (newValue && ['graficos', 'simulador', 'decision'].includes(newValue) && newValue !== activeTab) {
        setActiveTab(newValue);
        if (!e) { // Si no es un evento de storage, actualizar el hash
          window.history.replaceState(null, '', `#${newValue}`);
        }
      }
    };

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['graficos', 'simulador', 'decision'].includes(hash) && hash !== activeTab) {
        setActiveTab(hash);
        localStorage.setItem('activeTab', hash);
      }
    };

    // Verificar el estado actual
    handleStorageChange(null);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [activeTab]);

  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      localStorage.setItem('activeTab', tab);
      window.history.replaceState(null, '', `#${tab}`);
    }
  }, [activeTab]);

  const getActiveTabTitle = () => {
    switch(activeTab) {
      case 'graficos': 
        return 'Análisis Comparativo de Alternativas Energéticas';
      case 'simulador': 
        return 'Simulador Personalizado de Energía Solar';
      case 'decision': 
        return 'Asistente de Toma de Decisiones';
      default: 
        return 'Dashboard Energético';
    }
  };

  return (
    <>
      <SkipLink targetId="main-content" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <header className="bg-white dark:bg-gray-800 shadow-xs">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Energético
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </button>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-6">
          <nav className="mb-8">
            <div 
              className="flex flex-wrap gap-2 md:space-x-4" 
              role="tablist"
              aria-label="Secciones principales"
              onKeyDown={(event) => {
                const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
                const current = tabs.indexOf(event.target as HTMLButtonElement);
                if (current < 0) return;
                let next: number;
                switch (event.key) {
                  case 'ArrowRight': next = (current + 1) % tabs.length; break;
                  case 'ArrowLeft': next = (current - 1 + tabs.length) % tabs.length; break;
                  case 'Home': next = 0; break;
                  case 'End': next = tabs.length - 1; break;
                  default: return;
                }
                event.preventDefault();
                tabs[next].focus();
                tabs[next].click();
              }}
            >
              <Tab
                tabId="graficos"
                isActive={activeTab === 'graficos'}
                onClick={() => handleTabChange('graficos')}
                icon="📊"
              >
                Análisis Comparativo
              </Tab>
              <Tab
                tabId="simulador"
                isActive={activeTab === 'simulador'}
                onClick={() => handleTabChange('simulador')}
                icon="🔍"
              >
                Simulador Personalizado
              </Tab>
              <Tab
                tabId="decision"
                isActive={activeTab === 'decision'}
                onClick={() => handleTabChange('decision')}
                icon="🧠"
              >
                Asistente de Decisión
              </Tab>
            </div>
          </nav>
          
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              {getActiveTabTitle()}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'graficos' && 
                'Visualización y comparación detallada entre diferentes alternativas energéticas.'}
              {activeTab === 'simulador' && 
                'Configure parámetros personalizados para evaluar el potencial de sistemas fotovoltaicos.'}
              {activeTab === 'decision' && 
                'Responda preguntas sencillas para recibir recomendaciones adaptadas a su situación.'}
            </p>
          </div>
          
          <main id="main-content" tabIndex={-1} className="pb-12">
            <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <Suspense fallback={<LoadingSpinner />}>
                  {activeTab === 'graficos' && <GraficosComparativos />}
                  {activeTab === 'simulador' && <SimuladorPersonalizado />}
                  {activeTab === 'decision' && <DecisionGuide />}
                </Suspense>
              )}
            </div>
          </main>
        </div>
        
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-auto">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dashboard Comparativo de Energía © 2023
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-sm text-blue-700 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Volver arriba ↑
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default memo(Dashboard);