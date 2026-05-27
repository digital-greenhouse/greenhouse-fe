import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { convertToBase64 } from './ConvertBase64File';

describe('convertToBase64', () => {
  const originalFileReader = global.FileReader;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.FileReader = originalFileReader;
  });

  it('rejects when no file is provided', async () => {
    await expect(convertToBase64()).rejects.toMatchObject({
      message: 'No se recibio ningun archivo',
    });
  });

  it('resolves base64 payload and mime type', async () => {
    class MockFileReader {
      readAsDataURL() {
        this.result = 'data:text/plain;base64,Zm9v';
        setTimeout(() => this.onload?.(), 0);
      }
    }

    global.FileReader = MockFileReader;

    const file = new File(['foo'], 'foo.txt', { type: 'text/plain' });
    await expect(convertToBase64(file)).resolves.toEqual({
      base64: 'Zm9v',
      mimeType: 'text/plain',
    });
  });

  it('rejects when FileReader errors', async () => {
    class MockFileReader {
      readAsDataURL() {
        setTimeout(() => this.onerror?.(new Error('read error')), 0);
      }
    }

    global.FileReader = MockFileReader;

    const file = new File(['foo'], 'foo.txt', { type: 'text/plain' });
    await expect(convertToBase64(file)).rejects.toBeInstanceOf(Error);
  });

  it('extracts png mime type correctly', async () => {
    class MockFileReader {
      readAsDataURL() {
        this.result = 'data:image/png;base64,aGVsbG8=';
        setTimeout(() => this.onload?.(), 0);
      }
    }

    global.FileReader = MockFileReader;

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    await expect(convertToBase64(file)).resolves.toEqual({
      base64: 'aGVsbG8=',
      mimeType: 'image/png',
    });
  });

  it('extracts jpeg mime type correctly', async () => {
    class MockFileReader {
      readAsDataURL() {
        this.result = 'data:image/jpeg;base64,cGhvdG8=';
        setTimeout(() => this.onload?.(), 0);
      }
    }

    global.FileReader = MockFileReader;

    const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
    await expect(convertToBase64(file)).resolves.toEqual({
      base64: 'cGhvdG8=',
      mimeType: 'image/jpeg',
    });
  });

  it('returns the full base64 payload for complex metadata', async () => {
    class MockFileReader {
      readAsDataURL() {
        this.result = 'data:application/pdf;charset=utf-8;base64,cGRmLWRhdGE=';
        setTimeout(() => this.onload?.(), 0);
      }
    }

    global.FileReader = MockFileReader;

    const file = new File(['pdf-data'], 'file.pdf', { type: 'application/pdf' });
    await expect(convertToBase64(file)).resolves.toEqual({
      base64: 'cGRmLWRhdGE=',
      mimeType: 'application/pdf;charset=utf-8',
    });
  });
});