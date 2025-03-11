/**
 * Mock implementation of ResizeObserver for Jest tests
 */
export default class ResizeObserverMock {
  private callback: ResizeObserverCallback;
  private elements: Element[];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    this.elements = [];
  }

  observe(element: Element) {
    if (!this.elements.includes(element)) {
      this.elements.push(element);
    }
  }

  unobserve(element: Element) {
    const index = this.elements.indexOf(element);
    if (index !== -1) {
      this.elements.splice(index, 1);
    }
  }

  disconnect() {
    this.elements = [];
  }

  // Helper method to trigger resize events in tests
  triggerResize() {
    if (this.elements.length > 0) {
      const entries = this.elements.map(element => ({
        target: element,
        contentRect: element.getBoundingClientRect(),
        borderBoxSize: [{
          blockSize: 0,
          inlineSize: 0
        }],
        contentBoxSize: [{
          blockSize: 0,
          inlineSize: 0
        }],
        devicePixelContentBoxSize: [{
          blockSize: 0,
          inlineSize: 0
        }]
      }));
      this.callback(entries as ResizeObserverEntry[], this as unknown as ResizeObserver);
    }
  }
}