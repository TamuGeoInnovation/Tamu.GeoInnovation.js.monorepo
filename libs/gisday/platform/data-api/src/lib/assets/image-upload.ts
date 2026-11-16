import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';

import { IMAGE_SIZE_LIMITS, ImageSize, exceedsImageSizeLimits, readImageSize } from '@tamu-gisc/common/node/images';
import { UPLOAD_IMAGE_RULES, uploadImageRefusal } from '@tamu-gisc/gisday/common';

/**
 * The image formats an upload may be, judged by content (#2937). Defined once in `@tamu-gisc/gisday/common`, which the site
 * reads too, so its logo picker offers the same types and refuses another in the same words (#3009).
 */
export const UPLOAD_IMAGE_FORMATS: ReadonlyArray<ImageSize['format']> = UPLOAD_IMAGE_RULES.formats;

/**
 * Checks an uploaded image before anything decodes or stores it, and returns it named for what it is. Every image upload uses
 * this: speaker photos, a speaker's own proposed photo, and sponsor, organization and place logos (#2352, #2937).
 *
 * - **By content, not by name or declared type**, both of which the sender chooses: anything whose header is not a JPEG or PNG
 *   is refused with 400, so an SVG renamed to `.png` is still refused.
 * - **By declared size**: the upload limit caps the file, not the image it decodes to, and a few KB can declare 50,000 x 50,000
 *   pixels and make a decoder allocate 10 GB. Read from the header alone, and refused with 413.
 * - **Named by content**: the stored file keeps its upload name, and the server picks its type from the extension, so the
 *   extension is set to the content's (`.png` or `.jpg`), and the type to match. A PNG named `logo.svg` is stored as `logo.png`.
 *
 * The file's byte size is capped before this, by `DEFAULT_UPLOAD_LIMITS` (5 MB) on the upload itself.
 *
 * @param label What the image is, for the message: "The photo", "The logo".
 */
export function refuseUnsafeImage<T extends { buffer?: Buffer; originalname?: string; mimetype?: string }>(
  file: T,
  label = 'The image'
): T & { originalname: string; mimetype: string } {
  const size = file?.buffer ? readImageSize(file.buffer) : null;

  if (!size || !UPLOAD_IMAGE_FORMATS.includes(size.format)) {
    throw new BadRequestException(uploadImageRefusal(label));
  }

  if (exceedsImageSizeLimits(size)) {
    throw new PayloadTooLargeException(
      `${label} is too large in pixels: ${size.width} x ${size.height}. The most is ${IMAGE_SIZE_LIMITS.maxSide} a side and ${IMAGE_SIZE_LIMITS.maxPixels / 1_000_000} megapixels.`
    );
  }

  return { ...file, originalname: namedFor(file.originalname, size.format), mimetype: `image/${size.format}` };
}

/** The name with its extension set to the format's: `.png`, or `.jpg` unless it is already `.jpeg`. */
function namedFor(name: string | undefined, format: ImageSize['format']): string {
  const base = (name ?? '').replace(/\.[^./\\]*$/, '') || 'image';
  const current = /\.([^./\\]*)$/.exec(name ?? '')?.[1]?.toLowerCase();

  if (format === 'jpeg') {
    return `${base}.${current === 'jpeg' || current === 'jpg' ? current : 'jpg'}`;
  }

  return `${base}.png`;
}
