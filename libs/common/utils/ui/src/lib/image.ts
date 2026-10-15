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
 * Images already this small, and within `maxDimension`, are sent as they are.
 */
const SMALL_ENOUGH_BYTES = 1024 * 1024;

/**
 * Shrinks a photograph in the browser before it is uploaded: at most `maxDimension` pixels on its
 * longest side, as a JPEG, turned the right way up from the camera's orientation. A phone's 2 to 8 MB
 * photograph typically becomes a few hundred kilobytes.
 *
 * The result carries none of the original's embedded data (EXIF), such as where it was taken.
 *
 * Never fails: when the browser cannot read or redraw the image, or the result would be no smaller,
 * the original file is returned.
 */
export async function shrinkImage(file: File, options: ShrinkImageOptions = {}): Promise<File> {
  const maxDimension = options.maxDimension ?? 1600;
  const quality = options.quality ?? 0.82;

  if (!file || !/^image\//.test(file.type) || typeof createImageBitmap !== 'function') {
    return file;
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));

    if (scale === 1 && file.size <= SMALL_ENOUGH_BYTES) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));

    if (!blob || blob.size >= file.size) {
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
