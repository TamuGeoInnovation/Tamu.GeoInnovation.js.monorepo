import { createJimp } from '@jimp/core';
import jpeg from '@jimp/js-jpeg';
import png from '@jimp/js-png';

import { fitImage } from '@tamu-gisc/common/node/images';

import { SPEAKER_PHOTO_FIT } from './speaker-photo';

const Jimp = createJimp({ formats: [jpeg, png] });

// Blocks of near-identical greys: a PNG stores it in few bytes, but scaling it down blends the edges into many new colours (#2426).
async function flatPng(width: number, height: number) {
  const image = new Jimp({ width, height, color: 0xffffffff });
  const data = image.bitmap.data;

  for (let i = 0; i < data.length; i += 4) {
    const p = i / 4;
    const block = Math.floor((p % width) / 6) * 31 + Math.floor(Math.floor(p / width) / 6) * 17;
    const grey = 118 + ((block * block) % 6) * 3;

    data[i] = grey;
    data[i + 1] = grey + 4;
    data[i + 2] = grey - 2;
  }

  return image.getBuffer('image/png', { deflateLevel: 9, colorType: 2 });
}

// fit-speaker-photos (#2352) applies SPEAKER_PHOTO_FIT to every stored photo through fitImage, and writes what it returns.
describe('the rule fit-speaker-photos and an upload share (#2426)', () => {
  it('never stores a photo larger than it was, and a re-run never grows it', async () => {
    const stored = await flatPng(1800, 1200);

    const first = await fitImage(stored, SPEAKER_PHOTO_FIT);
    const second = await fitImage(first.buffer, SPEAKER_PHOTO_FIT);

    expect(first.buffer.length).toBeLessThan(stored.length);
    expect(second.buffer.length).toBeLessThanOrEqual(first.buffer.length);
    expect(second.changed).toBe(false);
  }, 120_000);
});
