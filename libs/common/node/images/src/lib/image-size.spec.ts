import { createJimp } from '@jimp/core';
import jpeg from '@jimp/js-jpeg';
import png from '@jimp/js-png';

import { declaredJpeg, declaredPng } from './declared-image';
import { exceedsImageSizeLimits, readImageSize } from './image-size';

const Jimp = createJimp({ formats: [jpeg, png] });

describe('readImageSize', () => {
  it('reads a real PNG and JPEG as their decoder does', async () => {
    const image = new Jimp({ width: 321, height: 123, color: 0x336699ff });

    expect(readImageSize(await image.getBuffer('image/png'))).toEqual({ format: 'png', width: 321, height: 123 });
    expect(readImageSize(await image.getBuffer('image/jpeg'))).toEqual({ format: 'jpeg', width: 321, height: 123 });
  });

  it("reads a crafted file's declared size without decoding it", () => {
    expect(readImageSize(declaredPng(50_000, 50_000))).toEqual({ format: 'png', width: 50_000, height: 50_000 });
    expect(readImageSize(declaredJpeg(60_000, 40_000))).toEqual({ format: 'jpeg', width: 60_000, height: 40_000 });
  });

  it('reads GIF and WebP headers', () => {
    const gif = Buffer.concat([Buffer.from('GIF89a', 'latin1'), Buffer.from([0x40, 0x01, 0xf0, 0x00]), Buffer.alloc(8)]);
    // VP8X: flags, then width - 1 and height - 1 as 24-bit little-endian numbers.
    const webp = Buffer.alloc(30);
    webp.write('RIFF', 0, 'latin1');
    webp.write('WEBPVP8X', 8, 'latin1');
    webp.writeUIntLE(1999, 24, 3);
    webp.writeUIntLE(999, 27, 3);

    expect(readImageSize(gif)).toEqual({ format: 'gif', width: 320, height: 240 });
    expect(readImageSize(webp)).toEqual({ format: 'webp', width: 2000, height: 1000 });
  });

  it('returns null for anything it cannot read', () => {
    expect(readImageSize(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
    expect(readImageSize(Buffer.from([0xff, 0xd8, 0xff, 0xda, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))).toBeNull();
    expect(readImageSize(Buffer.alloc(0))).toBeNull();
    expect(readImageSize(declaredPng(0, 100))).toBeNull();
  });
});

describe('exceedsImageSizeLimits', () => {
  it('allows a camera photo and refuses 8001 a side or more than 40 megapixels', () => {
    expect(exceedsImageSizeLimits({ format: 'jpeg', width: 6000, height: 4000 })).toBe(false);
    expect(exceedsImageSizeLimits({ format: 'jpeg', width: 8000, height: 5000 })).toBe(false);
    expect(exceedsImageSizeLimits({ format: 'png', width: 8001, height: 100 })).toBe(true);
    expect(exceedsImageSizeLimits({ format: 'png', width: 7000, height: 7000 })).toBe(true);
  });
});
