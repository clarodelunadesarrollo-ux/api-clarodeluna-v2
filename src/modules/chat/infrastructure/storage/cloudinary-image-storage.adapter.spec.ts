import { HttpException } from '@nestjs/common';

const uploadStreamMock = jest.fn();
const urlMock = jest.fn();
const configMock = jest.fn();

jest.mock('cloudinary', () => ({
  v2: {
    config: (...args: unknown[]) => configMock(...args),
    uploader: {
      upload_stream: (...args: unknown[]) => uploadStreamMock(...args),
    },
    url: (...args: unknown[]) => urlMock(...args),
  },
}));

import { CloudinaryImageStorageAdapter } from './cloudinary-image-storage.adapter';

type UploadCallback = (
  error: Error | null,
  result: { public_id: string; version: number; secure_url: string } | null,
) => void;

describe('CloudinaryImageStorageAdapter', () => {
  const config = {
    cloudName: 'cloud',
    apiKey: 'key',
    apiSecret: 'secret',
    folder: 'chat',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function buildAdapter(): CloudinaryImageStorageAdapter {
    return new CloudinaryImageStorageAdapter(config);
  }

  it('uploads the image as a private (authenticated) asset', async () => {
    const end = jest.fn();
    uploadStreamMock.mockImplementation(
      (options: Record<string, unknown>, callback: UploadCallback) => {
        // Resolve asynchronously as the real SDK does once the stream ends.
        queueMicrotask(() =>
          callback(null, {
            public_id: 'chat/pic',
            version: 123,
            secure_url: 'https://res.cloudinary.com/cloud/image/authenticated/v123/chat/pic.jpg',
          }),
        );
        return { end };
      },
    );
    urlMock.mockReturnValue('https://signed.example/chat/pic.jpg');

    const adapter = buildAdapter();
    await adapter.upload({ buffer: Buffer.from('x'), mimeType: 'image/png' });

    const uploadOptions = uploadStreamMock.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(uploadOptions.type).toBe('authenticated');
    expect(uploadOptions.resource_type).toBe('image');
    expect(uploadOptions.folder).toBe('chat');
  });

  it('returns a signed delivery URL instead of the raw public URL', async () => {
    const end = jest.fn();
    uploadStreamMock.mockImplementation(
      (_options: Record<string, unknown>, callback: UploadCallback) => {
        queueMicrotask(() =>
          callback(null, {
            public_id: 'chat/pic',
            version: 123,
            secure_url: 'https://res.cloudinary.com/cloud/image/authenticated/v123/chat/pic.jpg',
          }),
        );
        return { end };
      },
    );
    urlMock.mockReturnValue('https://signed.example/chat/pic.jpg');

    const adapter = buildAdapter();
    const result = await adapter.upload({
      buffer: Buffer.from('x'),
      mimeType: 'image/png',
    });

    expect(result.url).toBe('https://signed.example/chat/pic.jpg');
    const urlOptions = urlMock.mock.calls[0][1] as Record<string, unknown>;
    expect(urlMock.mock.calls[0][0]).toBe('chat/pic');
    expect(urlOptions.type).toBe('authenticated');
    expect(urlOptions.sign_url).toBe(true);
    expect(urlOptions.secure).toBe(true);
    expect(urlOptions.version).toBe(123);
  });

  it('fails with 503 when credentials are missing', async () => {
    const adapter = new CloudinaryImageStorageAdapter({
      cloudName: undefined,
      apiKey: undefined,
      apiSecret: undefined,
      folder: 'chat',
    });

    await expect(
      adapter.upload({ buffer: Buffer.from('x'), mimeType: 'image/png' }),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
