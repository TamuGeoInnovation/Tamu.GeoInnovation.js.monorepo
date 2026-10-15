import { shrinkImage } from './image';

describe('shrinkImage', () => {
  let drawn: Array<{ width: number; height: number }>;
  let encodedBytes: number;
  let bitmapOptions: Array<unknown>;

  const photo = (bytes: number, type = 'image/jpeg', name = 'IMG_0001.HEIC') =>
    new File([new Uint8Array(bytes)], name, { type, lastModified: 1234 });

  const withBitmap = (width: number, height: number) => {
    (globalThis as unknown as { createImageBitmap: unknown }).createImageBitmap = jest.fn((_, options) => {
      bitmapOptions.push(options);
      return Promise.resolve({ width, height, close: jest.fn() });
    });
  };

  beforeEach(() => {
    drawn = [];
    bitmapOptions = [];
    encodedBytes = 300 * 1024;

    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
      return { drawImage: () => drawn.push({ width: this.width, height: this.height }) } as never;
    });
    jest
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation((done, type) => done(new Blob([new Uint8Array(encodedBytes)], { type })));
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  it('keeps a portrait photograph upright and in proportion', async () => {
    withBitmap(3024, 4032);

    await shrinkImage(photo(4 * 1024 * 1024));

    expect(drawn).toEqual([{ width: 1200, height: 1600 }]);
    expect(bitmapOptions).toEqual([{ imageOrientation: 'from-image' }]);
  });

  it('leaves a photograph that is already small as it is', async () => {
    withBitmap(1200, 900);
    const small = photo(400 * 1024);

    await expect(shrinkImage(small)).resolves.toBe(small);
    expect(drawn).toEqual([]);
  });

  it('re-encodes a heavy photograph that is within the size limit', async () => {
    withBitmap(1600, 1200);

    const result = await shrinkImage(photo(3 * 1024 * 1024));

    expect(drawn).toEqual([{ width: 1600, height: 1200 }]);
    expect(result.size).toBe(300 * 1024);
  });

  it('sends the original when the result would be no smaller', async () => {
    withBitmap(4032, 3024);
    encodedBytes = 5 * 1024 * 1024;
    const original = photo(4 * 1024 * 1024);

    await expect(shrinkImage(original)).resolves.toBe(original);
  });

  it('sends the original when the browser cannot read the image', async () => {
    (globalThis as unknown as { createImageBitmap: unknown }).createImageBitmap = jest.fn(() => Promise.reject(new Error('unsupported')));
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
