// Mock de ResizeObserver para entorno de pruebas
class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.observables = new Map();
  }

  observe(target) {
    this.observables.set(target, {
      target,
      contentRect: {
        width: 100,
        height: 100,
        top: 0,
        left: 0,
        bottom: 100,
        right: 100,
        x: 0,
        y: 0
      }
    });

    // Llamamos al callback de inmediato con valores fijos
    if (this.callback) {
      this.callback(Array.from(this.observables.values()));
    }
  }

  unobserve(target) {
    this.observables.delete(target);
  }

  disconnect() {
    this.observables.clear();
  }
}

// Exportar el mock para que pueda ser importado donde sea necesario
export default ResizeObserverMock;