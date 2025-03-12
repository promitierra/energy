/**
 * Mock implementation of ResizeObserver for testing environments
 */

class ResizeObserverMock {
  private callback: ResizeObserverCallback;
  private elements: Element[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(element: Element): void {
    if (!this.elements.includes(element)) {
      this.elements.push(element);
    }
  }

  unobserve(element: Element): void {
    const index = this.elements.indexOf(element);
    if (index !== -1) {
      this.elements.splice(index, 1);
    }
  }

  disconnect(): void {
    this.elements = [];
  }

  // Helper method to trigger resize events in tests
  triggerResize(entries: ResizeObserverEntry[]): void {
    if (this.elements.length > 0) {
      this.callback(entries, this);
    }
  }
}

export default ResizeObserverMock;