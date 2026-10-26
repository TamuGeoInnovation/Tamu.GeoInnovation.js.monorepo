export interface ImageSize {
  format: 'png' | 'jpeg' | 'gif' | 'webp';
  width: number;
  height: number;
}

/**
 * The most an upload may declare: 8000 px a side, and 40 megapixels in all. A decoder allocates width x height x 4 bytes before
 * it looks at the pixel data, so a file of a few KB declaring 50,000 x 50,000 asks for 10 GB. The upload limit caps the file,
 * not that. 40 megapixels is 160 MB decoded, more than any camera photo a person would upload and well within the API's memory.
 */
export const IMAGE_SIZE_LIMITS = { maxSide: 8000, maxPixels: 40_000_000 };

/**
 * Reads an image's declared width and height from its header, without decoding it: PNG's IHDR, JPEG's start-of-frame, GIF's
 * logical screen, and WebP's VP8, VP8L or VP8X header. Returns null for anything else, or a header too short or malformed to
 * read, which callers should treat as not an image.
 */
export function readImageSize(buffer: Buffer): ImageSize | null {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  const size = png(buffer) ?? jpeg(buffer) ?? gif(buffer) ?? webp(buffer);

  return size && size.width > 0 && size.height > 0 ? size : null;
}

/**
 * Whether a declared size is over `limits`: either side, or the two multiplied.
 */
export function exceedsImageSizeLimits(size: ImageSize, limits = IMAGE_SIZE_LIMITS): boolean {
  return size.width > limits.maxSide || size.height > limits.maxSide || size.width * size.height > limits.maxPixels;
}

function png(b: Buffer): ImageSize | null {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  if (b.length < 24 || !signature.every((byte, i) => b[i] === byte) || b.toString('latin1', 12, 16) !== 'IHDR') {
    return null;
  }

  return { format: 'png', width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function jpeg(b: Buffer): ImageSize | null {
  if (b[0] !== 0xff || b[1] !== 0xd8) {
    return null;
  }

  // Walk the segments to the first start-of-frame (SOF0 to SOF15, except DHT C4, JPG C8 and DAC CC, which share the range).
  let p = 2;

  while (p + 9 < b.length) {
    if (b[p] !== 0xff) {
      return null;
    }

    const marker = b[p + 1];

    // Fill bytes, and the markers that stand alone without a length.
    if (marker === 0xff) {
      p += 1;
      continue;
    }

    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      p += 2;
      continue;
    }

    // Start of scan, or end of image, before any frame: there is no size to read.
    if (marker === 0xda || marker === 0xd9) {
      return null;
    }

    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { format: 'jpeg', width: b.readUInt16BE(p + 7), height: b.readUInt16BE(p + 5) };
    }

    const length = b.readUInt16BE(p + 2);

    if (length < 2) {
      return null;
    }

    p += 2 + length;
  }

  return null;
}

function gif(b: Buffer): ImageSize | null {
  const signature = b.toString('latin1', 0, 6);

  if (signature !== 'GIF87a' && signature !== 'GIF89a') {
    return null;
  }

  return { format: 'gif', width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
}

function webp(b: Buffer): ImageSize | null {
  if (b.length < 30 || b.toString('latin1', 0, 4) !== 'RIFF' || b.toString('latin1', 8, 12) !== 'WEBP') {
    return null;
  }

  const chunk = b.toString('latin1', 12, 16);

  if (chunk === 'VP8 ') {
    // Lossy: the frame's 14-bit width and height, after its 3-byte tag and 3-byte start code.
    return { format: 'webp', width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }

  if (chunk === 'VP8L' && b[20] === 0x2f) {
    // Lossless: 14 bits each, minus one, packed after the 0x2f signature byte.
    const bits = b.readUInt32LE(21);

    return { format: 'webp', width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }

  if (chunk === 'VP8X') {
    // Extended: 24 bits each, minus one, after the flags.
    return { format: 'webp', width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
  }

  return null;
}
