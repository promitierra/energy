/**
 * Mock implementation of File for testing environments
 */

class FileMock {
  private content: string | Blob;
  private name: string;
  private options: FilePropertyBag;

  constructor(content: string | Blob | BlobPart[], name: string, options: FilePropertyBag = {}) {
    this.content = typeof content === 'string' ? content : new Blob(Array.isArray(content) ? content : [content]);
    this.name = name;
    this.options = options;
  }

  get size(): number {
    return typeof this.content === 'string' ? this.content.length : this.content.size;
  }

  get type(): string {
    return this.options.type || '';
  }

  get lastModified(): number {
    return this.options.lastModified || Date.now();
  }

  slice(start?: number, end?: number, contentType?: string): Blob {
    if (typeof this.content === 'string') {
      const slicedContent = this.content.slice(start || 0, end);
      return new Blob([slicedContent], { type: contentType || this.type });
    } else {
      return this.content.slice(start, end, contentType);
    }
  }

  stream(): ReadableStream {
    throw new Error('Not implemented in mock');
  }

  text(): Promise<string> {
    return Promise.resolve(typeof this.content === 'string' ? this.content : '');
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    throw new Error('Not implemented in mock');
  }
}

global.File = FileMock as any;

export default FileMock;