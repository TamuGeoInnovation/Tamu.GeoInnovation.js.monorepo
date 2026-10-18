import type { Mock } from 'vitest';
import { shrinkImage } from './image';

describe('shrinkImage', () => {
  let drawn: Array<{ width: number; height: number }>;
  let encodedBytes: number;
  let bitmapOptions: Array<unknown>;
  let imageSize: { width: number; height: number } | undefined;

  const photo = (bytes: number, type = 'image/jpeg', name = 'IMG_0001.HEIC') =>
    new File([new Uint8Array(bytes)], name, { type, lastModified: 1234 });

  /**
   * A browser whose decoded image is `width` by `height`, upright, and which honours a requested
   * width or height the way createImageBitmap does: the other side keeps the proportions.
   */
  const withBitmap = (width: number, height: number) => {
    imageSize = { width, height };
    (globalThis as unknown as { createImageBitmap: unknown }).createImageBitmap = vi.fn(
      (_, options: { resizeWidth?: number; resizeHeight?: number }) => {
        bitmapOptions.push(options);

        if (options.resizeWidth) {
          return Promise.resolve({ width: options.resizeWidth, height: Math.round((height * options.resizeWidth) / width), close: vi.fn() });
        }

        if (options.resizeHeight) {
          return Promise.resolve({ width: Math.round((width * options.resizeHeight) / height), height: options.resizeHeight, close: vi.fn() });
        }

        return Promise.resolve({ width, height, close: vi.fn() });
      }
    );
  };

  beforeEach(() => {
    drawn = [];
    bitmapOptions = [];
    encodedBytes = 300 * 1024;
    imageSize = undefined;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
      return { drawImage: () => drawn.push({ width: this.width, height: this.height }) } as never;
    });
    vi
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation((done, type) => done(new Blob([new Uint8Array(encodedBytes)], { type })));

    // jsdom loads no images: this one "loads" with the size given to withBitmap, or fails without one.
    (URL as unknown as { createObjectURL: unknown }).createObjectURL = vi.fn(() => 'blob:photo');
    (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn();
    // A function, not an arrow: the code calls `new Image()`, and Vitest constructs the mock's own implementation.
    vi.spyOn(window, 'Image').mockImplementation(function () {
      const image = { onload: undefined, onerror: undefined, naturalWidth: 0, naturalHeight: 0 } as unknown as HTMLImageElement;

      Object.defineProperty(image, 'src', {
        set: () =>
          setTimeout(() => {
            if (imageSize) {
              Object.assign(image, { naturalWidth: imageSize.width, naturalHeight: imageSize.height });
              image.onload(undefined);
            } else {
              image.onerror(undefined);
            }
          })
      });

      return image;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as unknown as { createImageBitmap?: unknown }).createImageBitmap;
  });

  it('shrinks a large photograph to 1,600 px on its longest side, as a JPEG', async () => {
    withBitmap(4032, 3024);

    const result = await shrinkImage(photo(4 * 1024 * 1024));

    expect(drawn).toEqual([{ width: 1600, height: 1200 }]);
    expect(result.type).toBe('image/jpeg');
    expect(result.size).toBe(300 * 1024);
    expect(result.name).toBe('IMG_0001.jpg');
    expect(result.lastModified).toBe(1234);
  });

  it('decodes a large photograph straight to its new size, upright and with the best filter', async () => {
    withBitmap(4032, 3024);

    await shrinkImage(photo(4 * 1024 * 1024));

    expect(bitmapOptions).toEqual([{ resizeWidth: 1600, resizeQuality: 'high', imageOrientation: 'from-image' }]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo');
  });

  it('keeps a portrait photograph upright and in proportion', async () => {
    withBitmap(3024, 4032);

    await shrinkImage(photo(4 * 1024 * 1024));

    expect(drawn).toEqual([{ width: 1200, height: 1600 }]);
    expect(bitmapOptions).toEqual([{ resizeHeight: 1600, resizeQuality: 'high', imageOrientation: 'from-image' }]);
  });

  it('redraws a photograph that is already small, so its embedded data (EXIF), such as where it was taken, is not sent', async () => {
    withBitmap(1200, 900);
    const small = photo(400 * 1024);

    const result = await shrinkImage(small);

    expect(result).not.toBe(small);
    expect(result.type).toBe('image/jpeg');
    expect(drawn).toEqual([{ width: 1200, height: 900 }]);
    expect(bitmapOptions).toEqual([{ imageOrientation: 'from-image' }]);
  });

  it('redraws a photograph even when the result is no smaller, for the same reason', async () => {
    withBitmap(1200, 900);
    encodedBytes = 500 * 1024;
    const original = photo(400 * 1024);

    const result = await shrinkImage(original);

    expect(result).not.toBe(original);
    expect(result.size).toBe(500 * 1024);
  });

  it('re-encodes a heavy photograph that is within the size limit', async () => {
    withBitmap(1600, 1200);

    const result = await shrinkImage(photo(3 * 1024 * 1024));

    expect(drawn).toEqual([{ width: 1600, height: 1200 }]);
    expect(result.size).toBe(300 * 1024);
  });

  it('decodes at full size, then shrinks, when the size cannot be read first', async () => {
    withBitmap(4032, 3024);
    imageSize = undefined;

    await shrinkImage(photo(4 * 1024 * 1024));

    expect(bitmapOptions).toEqual([{ imageOrientation: 'from-image' }]);
    expect(drawn).toEqual([{ width: 1600, height: 1200 }]);
  });

  it('decodes at full size, then shrinks, when the browser refuses the resize options', async () => {
    withBitmap(4032, 3024);
    const decode = globalThis.createImageBitmap as unknown as Mock;
    const honoured = decode.getMockImplementation();
    decode.mockImplementation((file, options) => (options.resizeWidth ? Promise.reject(new Error('unsupported')) : honoured(file, options)));

    const result = await shrinkImage(photo(4 * 1024 * 1024));

    expect(drawn).toEqual([{ width: 1600, height: 1200 }]);
    expect(result.type).toBe('image/jpeg');
  });

  it('sends the original when the browser cannot read the image', async () => {
    (globalThis as unknown as { createImageBitmap: unknown }).createImageBitmap = vi.fn(() => Promise.reject(new Error('unsupported')));
    const original = photo(4 * 1024 * 1024);

    await expect(shrinkImage(original)).resolves.toBe(original);
  });

  it('sends the original when the browser cannot shrink images at all', async () => {
    const original = photo(4 * 1024 * 1024);

    await expect(shrinkImage(original)).resolves.toBe(original);
  });

  it('leaves anything that is not an image alone', async () => {
    withBitmap(4032, 3024);
    const notAnImage = photo(4 * 1024 * 1024, 'application/pdf', 'form.pdf');

    await expect(shrinkImage(notAnImage)).resolves.toBe(notAnImage);
  });
});
