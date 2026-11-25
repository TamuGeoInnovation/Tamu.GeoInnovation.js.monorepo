/** Where Facilities Analytics & Mapping keeps the photographs both layers draw from. */
const IMAGE_BASE_URL = 'https://aggiemap.tamu.edu/images/cb';

/**
 * The carousel URLs for a layer's `images` field.
 *
 * Both Points of Interest and Nature Rx hold their photographs as one comma-separated string of file
 * names in the same folder, so this is the one place that turns that field into URLs (#2630).
 *
 * **The trimming is the point.** The two services write the field differently - Points of Interest has
 * `a.jpg,b.jpg` and Nature Rx has `a.jpg, b.jpg` - so a bare `split(',')` gives every name after the
 * first a leading space, and every image but the first fails to load. A name is trimmed, and an empty
 * one (a trailing comma, or a field that is only separators) is dropped rather than becoming a request
 * for the folder itself.
 */
export function carouselImageUrls(images: string | null | undefined): Array<string> {
  if (!images) {
    return [];
  }

  return images
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name) => `${IMAGE_BASE_URL}/${name}`);
}
