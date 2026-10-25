import { createJimp } from '@jimp/core';
import jpeg from '@jimp/js-jpeg';
import png from '@jimp/js-png';
import { methods as resize } from '@jimp/plugin-resize';

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
 * Scales an uploaded JPEG or PNG down to the size it is shown at, re-encodes it in its own format, and drops its
 * metadata (EXIF, including any location), after applying its EXIF orientation so it still shows the right way up.
 *
 * Anything else (WebP, SVG, GIF, ...) comes back as it was, because a stored file keeps its name and so its format. An image
 * that is already small, within `shortSide` and carries no metadata comes back untouched, and one that would only be
 * re-encoded keeps its original bytes if they were smaller.
 */
export async function fitImage(input: Buffer, options: FitImageOptions): Promise<FitImageResult> {
  const { shortSide, keepBelowBytes = 300 * 1024, quality = 80 } = options;

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

  const data =
    mime === 'image/png'
      ? await image.getBuffer('image/png', { deflateLevel: 9, colorType: isOpaque(image.bitmap.data) ? 2 : 6 })
      : await image.getBuffer('image/jpeg', { quality });

  // Re-encoding a small image can make it larger. Keep the original then, unless it had to change anyway: it was too
  // large, or it carried metadata that should not be served.
  if (!tooLarge && !hasMetadata && data.length >= input.length) {
    return unchanged(input, mime, width, height, 're-encoding would not make it smaller');
  }

  return {
    buffer: data,
    changed: true,
    reason: [tooLarge && `scaled to ${image.bitmap.width} x ${image.bitmap.height}`, hasMetadata && 'metadata removed', !tooLarge && 're-encoded']
      .filter(Boolean)
      .join(', '),
    mime,
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
