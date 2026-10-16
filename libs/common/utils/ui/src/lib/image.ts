export interface ShrinkImageOptions {
  /**
   * The longest side, in pixels, the image may keep. Defaults to 1,600.
   */
  maxDimension?: number;

  /**
   * JPEG quality, 0 to 1. Defaults to 0.82.
   */
  quality?: number;
}

/**
 * Shrinks a photograph in the browser before it is uploaded: at most `maxDimension` pixels on its
 * longest side, as a JPEG, turned the right way up from the camera's orientation. A phone's 2 to 8 MB
 * photograph typically becomes a few hundred kilobytes.
 *
 * Every image the browser can read is redrawn, however small it already is, so the result never
 * carries the original's embedded data (EXIF), such as where it was taken.
 *
 * Never fails: when the browser cannot read or redraw the image, the original file is returned, and
 * that one keeps whatever embedded data it has.
 */
export async function shrinkImage(file: File, options: ShrinkImageOptions = {}): Promise<File> {
  const maxDimension = options.maxDimension ?? 1600;
  const quality = options.quality ?? 0.82;

  if (!file || !/^image\//.test(file.type) || typeof createImageBitmap !== 'function') {
    return file;
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await decodeImage(file, maxDimension);

    // The decode may already be at the right size; this also covers a browser that ignored the size.
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));

    if (!blob) {
      return file;
    }

    return new File([blob], file.name.replace(/\.[^.]*$/, '') + '.jpg', {
      type: 'image/jpeg',
      lastModified: file.lastModified
    });
  } catch {
    return file;
  } finally {
    bitmap?.close?.();
  }
}

/**
 * Decodes an image upright, and no larger than it needs to be: when its size can be read first and it
 * is over `maxDimension`, straight to `maxDimension` on its longest side, so a 12-megapixel photograph
 * is never held in memory at full size and is scaled with the browser's best filter. Otherwise, or when
 * the browser refuses the resize options, at full size.
 */
async function decodeImage(file: File, maxDimension: number): Promise<ImageBitmap> {
  const size = await readImageSize(file).catch((): undefined => undefined);

  if (size && Math.max(size.width, size.height) > maxDimension) {
    // One side only: the browser keeps the proportions, even if it reads the orientation differently.
    const resize = size.width >= size.height ? { resizeWidth: maxDimension } : { resizeHeight: maxDimension };

    try {
      return await createImageBitmap(file, { ...resize, resizeQuality: 'high', imageOrientation: 'from-image' });
    } catch {
      // Decoded at full size below.
    }
  }

  return createImageBitmap(file, { imageOrientation: 'from-image' });
}

/**
 * An image's width and height, upright, read without drawing it.
 */
function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The image could not be read.'));
    };
    image.src = url;
  });
}
