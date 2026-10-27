import { createJimp } from '@jimp/core';
import jpeg from '@jimp/js-jpeg';
import png from '@jimp/js-png';
import { methods as resize } from '@jimp/plugin-resize';

import { exceedsImageSizeLimits, readImageSize } from './image-size';

// Pure JavaScript on purpose: uploads are untrusted, and a native image library (sharp, libvips) would decode them in native
// code and bring install scripts and platform binaries the lock otherwise avoids (#2293, #2326). Only the two formats
// re-encoded here are loaded. jimp applies a JPEG's EXIF orientation when it reads one, and its encoders write no metadata.
const Jimp = createJimp({ formats: [jpeg, png], plugins: [resize] });

export interface FitImageOptions {
  /**
   * The largest the image's shorter side may be, in pixels. A larger image is scaled down, keeping its aspect ratio,
   * until its shorter side is this size, so it still covers (`object-fit: cover`) any box up to this size square.
   */
  shortSide: number;

  /**
   * An image already within `shortSide`, carrying no metadata, and no larger than this many bytes is returned exactly as
   * it was. Defaults to 300 KB.
   */
  keepBelowBytes?: number;

  /**
   * The JPEG quality, 1 to 100. Defaults to 80.
   */
  quality?: number;
}

export interface FitImageResult {
  /**
   * The image to store: the input itself when `changed` is false.
   */
  buffer: Buffer;
  changed: boolean;
  /**
   * Why the image was or was not changed, for logs and dry runs.
   */
  reason: string;
  /**
   * The image's MIME type, or `unknown` when it is not a JPEG or PNG.
   */
  mime: string;
  before: { bytes: number; width: number; height: number };
  after: { bytes: number; width: number; height: number };
}

/**
 * Scales an uploaded JPEG or PNG down to the size it is shown at and drops its metadata (EXIF, including any location), after
 * applying its EXIF orientation so it still shows the right way up. It is re-encoded as a JPEG when it has no transparency and
 * as a PNG when it has, and an opaque PNG is also tried as a PNG; the smallest is stored, so a scaled image is
 * not larger than it needs to be (#2426). The stored file keeps its name, so a browser sniffs the format, as it does for any
 * `<img>`; `mime` says what was stored.
 *
 * Anything else (WebP, SVG, GIF, ...) comes back as it was. An image that is already small, within `shortSide` and carries
 * no metadata comes back untouched, and one that would only be re-encoded keeps its original bytes unless that saves a tenth.
 */
export async function fitImage(input: Buffer, options: FitImageOptions): Promise<FitImageResult> {
  const { shortSide, keepBelowBytes = 300 * 1024, quality = 80 } = options;

  // Never decode what the header says is too large: the decoder would allocate it all first (a decompression bomb). An upload
  // is refused before it gets here; this keeps fit-speaker-photos safe on files that were stored before that check existed.
  const declared = readImageSize(input);

  if (declared && exceedsImageSizeLimits(declared)) {
    return unchanged(input, 'unknown', declared.width, declared.height, 'too large in pixels to decode');
  }

  let image: Awaited<ReturnType<typeof Jimp.fromBuffer>>;

  try {
    image = await Jimp.fromBuffer(input);
  } catch {
    return unchanged(input, 'unknown', 0, 0, 'not a JPEG or PNG, so kept as it is');
  }

  const mime = image.mime === 'image/png' ? 'image/png' : 'image/jpeg';
  const { width, height } = image.bitmap;
  const tooLarge = Math.min(width, height) > shortSide;
  const hasMetadata = carriesMetadata(input, mime);

  if (!tooLarge && !hasMetadata && input.length <= keepBelowBytes) {
    return unchanged(input, mime, width, height, 'already small');
  }

  if (tooLarge) {
    const scale = shortSide / Math.min(width, height);

    image.resize({ w: Math.round(width * scale), h: Math.round(height * scale) });
  }

  // Scaling blends edges into new colours, so a PNG of flat areas can come out several times larger as a PNG (#2426). An
  // image with no transparency is therefore also tried as a JPEG, and the smallest result is stored; one with transparency
  // can only be a PNG.
  const opaque = isOpaque(image.bitmap.data);
  const candidates: Array<{ mime: string; data: Buffer }> = [];

  if (opaque) {
    candidates.push({ mime: 'image/jpeg', data: await image.getBuffer('image/jpeg', { quality }) });
  }

  if (mime === 'image/png' || !opaque) {
    candidates.push({ mime: 'image/png', data: await image.getBuffer('image/png', { deflateLevel: 9, colorType: opaque ? 2 : 6 }) });
  }

  const best = candidates.reduce((smallest, c) => (c.data.length < smallest.data.length ? c : smallest));
  const data = best.data;

  // Re-encoding an image already within the size can make it larger, or save a few bytes at the cost of another
  // generation of JPEG loss, which a second run would then repeat. Keep the original unless it saves a tenth, or had to
  // change anyway: it was too large, or it carried metadata that should not be served.
  if (!tooLarge && !hasMetadata && data.length > input.length * 0.9) {
    return unchanged(input, mime, width, height, 're-encoding would save less than a tenth');
  }

  return {
    buffer: data,
    changed: true,
    mime: best.mime,
    reason: [tooLarge && `scaled to ${image.bitmap.width} x ${image.bitmap.height}`, hasMetadata && 'metadata removed', !tooLarge && 're-encoded']
      .filter(Boolean)
      .join(', '),
    before: { bytes: input.length, width, height },
    after: { bytes: data.length, width: image.bitmap.width, height: image.bitmap.height }
  };
}

/**
 * Whether the file carries metadata worth removing: a JPEG's EXIF or XMP segment, or a PNG's EXIF or text chunks. Cameras
 * and editors write these before the image data, so only the start of the file is searched, which also keeps a chance
 * match inside compressed pixels from counting.
 */
function carriesMetadata(input: Buffer, mime: string): boolean {
  const markers = mime === 'image/png' ? ['eXIf', 'tEXt', 'iTXt', 'zTXt'] : ['Exif\0\0', 'http://ns.adobe.com/xap/1.0/'];
  const head = input.subarray(0, 64 * 1024);

  return markers.some((marker) => head.includes(marker, 0, 'latin1'));
}

/**
 * Whether every pixel of an RGBA bitmap is fully opaque, so a PNG can be written without its alpha channel.
 */
function isOpaque(rgba: Buffer): boolean {
  for (let i = 3; i < rgba.length; i += 4) {
    if (rgba[i] !== 255) {
      return false;
    }
  }

  return true;
}

function unchanged(input: Buffer, mime: string, width: number, height: number, reason: string): FitImageResult {
  const size = { bytes: input.length, width, height };

  return { buffer: input, changed: false, reason, mime, before: size, after: size };
}
