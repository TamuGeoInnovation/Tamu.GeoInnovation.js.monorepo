/**
 * The images an admin or a speaker may upload: speaker photos and sponsor, organization and place logos (#2937). One set
 * of rules, read by the API, which enforces them by content, and by the site, which offers only these types in its file
 * pickers and refuses another as soon as it is chosen, in the API's words (#3009).
 *
 * JPEG or PNG only. Uploads are served from the site's own origin, so a format a browser runs (SVG can carry script)
 * must never be stored, and a JPEG or PNG is all a photo or a logo needs. Up to 5 MB, where the API cuts an upload off
 * (`DEFAULT_UPLOAD_LIMITS`); every picker reads this, so the site refuses a larger one before sending it (#3074).
 */
export const UPLOAD_IMAGE_RULES = Object.freeze({
  /** The formats, as the API reads them from an image's header. */
  formats: Object.freeze(['jpeg', 'png'] as const),
  /** The types as a file input's `accept`. */
  accept: 'image/jpeg,image/png',
  /** The largest file, in bytes. */
  maxBytes: 5 * 1024 * 1024
});

/** A format an uploaded image may be. */
export type UploadImageFormat = (typeof UPLOAD_IMAGE_RULES.formats)[number];

/**
 * Why an image is refused, in the API's words: "The logo must be a JPEG or PNG image."
 *
 * @param label What the image is: "The photo", "The logo".
 */
export function uploadImageRefusal(label = 'The image'): string {
  return `${label} must be a JPEG or PNG image.`;
}

/**
 * For the site, before anything is sent: why a chosen file cannot be uploaded as an image, or null when it can. Judged
 * by the type the browser gives the file and its size; the API still judges the content, so a file renamed to look like
 * a PNG is refused when it is sent.
 */
export function uploadImageProblem(
  file: { type?: string; size?: number } | null | undefined,
  label = 'The image'
): string | null {
  const type = (file?.type ?? '').toLowerCase();

  if (!UPLOAD_IMAGE_RULES.formats.some((format) => type === `image/${format}`)) {
    return uploadImageRefusal(label);
  }

  if ((file?.size ?? 0) > UPLOAD_IMAGE_RULES.maxBytes) {
    return `${label} must be ${UPLOAD_IMAGE_RULES.maxBytes / (1024 * 1024)} MB or smaller.`;
  }

  return null;
}
