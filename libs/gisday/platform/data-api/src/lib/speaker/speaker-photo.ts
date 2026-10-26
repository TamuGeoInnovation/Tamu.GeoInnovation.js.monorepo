import { FitImageOptions } from '@tamu-gisc/common/node/images';

/**
 * How a speaker photo is stored (#2352), on upload and by the script that resizes the photos already stored.
 *
 * The largest a photo is drawn is on a presenter's own page: 420 x 322 px at tablet widths, 360 x 345 on a desktop. A
 * Presenters card draws it at 253 x 255. Twice the largest, for sharp screens, gives a shorter side of 840 px; the photo is
 * drawn with `object-fit: cover`, so a shorter side of 840 covers any of those boxes. Measured on the local stack,
 * 25 October 2026.
 *
 * JPEG quality 80 is jimp's default and keeps faces clean at that size. Photos already within the size and under 300 KB, with
 * no EXIF, are left exactly as they were.
 */
export const SPEAKER_PHOTO_FIT: FitImageOptions = { shortSide: 840, keepBelowBytes: 300 * 1024, quality: 80 };
