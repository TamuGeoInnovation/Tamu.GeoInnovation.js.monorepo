import { createJimp } from '@jimp/core';
import jpeg from '@jimp/js-jpeg';
import png from '@jimp/js-png';

import { declaredPng } from './declared-image';
import { fitImage } from './fit-image';

const Jimp = createJimp({ formats: [jpeg, png] });

// A photo-like image: a gradient with some noise, so the encoders have real work to do and sizes behave like a photo's.
async function photo(width: number, height: number, mime: 'image/jpeg' | 'image/png' = 'image/jpeg') {
  const image = new Jimp({ width, height, color: 0xffffffff });
  const data = image.bitmap.data;

  for (let i = 0; i < data.length; i += 4) {
    const p = i / 4;
    const x = p % width;
    const y = Math.floor(p / width);
    data[i] = (x * 255) / width;
    data[i + 1] = (y * 255) / height;
    data[i + 2] = (p * 7919) % 256;
  }

  return mime === 'image/png' ? image.getBuffer('image/png') : image.getBuffer('image/jpeg', { quality: 95 });
}

const sizeOf = async (buffer: Buffer) => {
  const { width, height } = (await Jimp.fromBuffer(buffer)).bitmap;

  return { width, height };
};

// An APP1 EXIF segment holding an empty TIFF directory, put straight after the JPEG's start-of-image marker.
function withExif(jpegBuffer: Buffer) {
  const tiff = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  const payload = Buffer.concat([Buffer.from('Exif\0\0', 'latin1'), tiff]);
  const segment = Buffer.concat([Buffer.from([0xff, 0xe1, (payload.length + 2) >> 8, (payload.length + 2) & 0xff]), payload]);

  return Buffer.concat([jpegBuffer.subarray(0, 2), segment, jpegBuffer.subarray(2)]);
}

// jimp is pure JavaScript: making, encoding and resizing a 1800 px image takes about a second on a quiet machine and several
// under the full check's load, so the tests that do get 30 s rather than vitest's 5.
const SLOW = 30_000;

describe('fitImage', () => {
  it('scales a large photo down until its shorter side is the target, and makes it smaller', async () => {
    const input = await photo(1800, 1800);

    const result = await fitImage(input, { shortSide: 840 });

    expect(result.changed).toBe(true);
    expect(await sizeOf(result.buffer)).toEqual({ width: 840, height: 840 });
    expect(result.buffer.length).toBeLessThan(input.length);
    expect(result.mime).toBe('image/jpeg');
  }, SLOW);

  it('keeps the aspect ratio, so the image still covers a square box of the target size', async () => {
    const result = await fitImage(await photo(1800, 1200), { shortSide: 840 });

    expect(await sizeOf(result.buffer)).toEqual({ width: 1260, height: 840 });
  }, SLOW);

  it('keeps a PNG a PNG', async () => {
    const result = await fitImage(await photo(1800, 1200, 'image/png'), { shortSide: 840 });

    expect(result.mime).toBe('image/png');
    expect(result.buffer.subarray(1, 4).toString('latin1')).toBe('PNG');
    expect(await sizeOf(result.buffer)).toEqual({ width: 1260, height: 840 });
  }, SLOW);

  it('changes nothing the second time, so a re-run does not lose JPEG quality again', async () => {
    const once = await fitImage(await photo(1800, 1800), { shortSide: 840, keepBelowBytes: 0 });

    const twice = await fitImage(once.buffer, { shortSide: 840, keepBelowBytes: 0 });

    expect(once.changed).toBe(true);
    expect(twice.changed).toBe(false);
    expect(twice.buffer).toBe(once.buffer);
  }, SLOW);

  it('leaves a small image with no metadata exactly as it was', async () => {
    const input = await photo(200, 200, 'image/png');

    const result = await fitImage(input, { shortSide: 840 });

    expect(result.changed).toBe(false);
    expect(result.buffer).toBe(input);
  });

  it("removes a small photo's EXIF, which can hold where it was taken", async () => {
    const input = withExif(await photo(200, 200));
    expect(input.includes('Exif\0\0', 0, 'latin1')).toBe(true);

    const result = await fitImage(input, { shortSide: 840 });

    expect(result.changed).toBe(true);
    expect(result.reason).toContain('metadata removed');
    expect(result.buffer.includes('Exif\0\0', 0, 'latin1')).toBe(false);
    expect(await sizeOf(result.buffer)).toEqual({ width: 200, height: 200 });
  });

  it('does not decode a file that declares more pixels than the limits, and returns it as it was', async () => {
    const bomb = declaredPng(50_000, 50_000);

    const result = await fitImage(bomb, { shortSide: 840 });

    expect(result.changed).toBe(false);
    expect(result.reason).toBe('too large in pixels to decode');
    expect(result.buffer).toBe(bomb);
  });

  it('returns a file it cannot read as it was', async () => {
    const input = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

    const result = await fitImage(input, { shortSide: 840 });

    expect(result.changed).toBe(false);
    expect(result.buffer).toBe(input);
  });
});
