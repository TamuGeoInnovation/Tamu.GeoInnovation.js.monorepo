# jimp 1.6.1 against 2.2.0: the same images through `fitImage`

The repository's own `fitImage` (`libs/common/node/images`), with GIS Day's speaker-photo settings (`shortSide` 840, 300 KB, quality 80), run on five inputs under jimp 1.6.1 (`before-1.6.1/`) and 2.2.0 (`after-2.2.0/`), for [#3755](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3755). Each folder's `results.json` holds what `fitImage` reported and each output's SHA-256.

| Input | What it tests |
| --- | --- |
| `photo.jpg` | A phone photo, 3024 x 4032: `apps/gisday-angular/src/assets/images/competitions/Sidewalk/IMG-1415.JPG` |
| `photo-exif6.jpg` | The same photo with an EXIF segment saying "rotate 90 degrees" ([`inputs/`](inputs/photo-exif6.jpg)): the orientation is applied and the EXIF removed |
| `background.jpg` | A wide JPEG: `apps/gisday-angular/src/assets/images/photos/landing-bg.jpg` |
| `screenshot.png` | An opaque PNG screenshot, stored as a JPEG because that is smaller: `apps/aggiemap-angular/src/assets/images/changelog/move-in/new.png` |
| `transparent.png` | A 1600 x 1200 gradient fading to transparent ([`inputs/`](inputs/transparent.png)), made with jimp 1.6.1: no repository PNG has transparency and is large enough to be scaled |

## What differs

`fitImage` writes its JPEGs with `chromaSubsampling: '4:4:4'` under jimp 2 (see below), and these outputs are with it.

| Output | 1.6.1 | 2.2.0 | Pixels, decoded by the same decoder |
| --- | --- | --- | --- |
| `photo.jpg` | 411,372 bytes | 405,855 bytes | mean channel difference 1.3, max 34; 1.6% of pixels off by more than 8 |
| `photo-exif6.jpg` | 410,950 bytes, 1120 x 840 | 405,147 bytes, 1120 x 840 | the same as above; rotated the same way, EXIF removed by both |
| `background.jpg` | 317,654 bytes | 312,327 bytes | mean 0.9, max 40; 0.8% of pixels off by more than 8 |
| `screenshot.jpg` | 157,548 bytes | 154,616 bytes | mean 0.5, max 26; 0.9% of pixels off by more than 8 |
| `transparent.png` | 200,452 bytes | 436,676 bytes | the same image: alpha identical everywhere; on white, at most 1.7 levels apart |

None matches byte for byte. Why:

- **JPEGs are 1 to 2% smaller and nearly the same.** The encoder is jimp's own `@jimp/jpeg-js` now, not `jpeg-js`, and it writes a 3 KB sRGB ICC profile (not personal metadata).
- **Full-resolution colour is kept on purpose.** From 2.1.0, jimp halves the resolution of the colour channels (4:2:0) below quality 90. That made files 5 to 25% smaller, but re-encoding `fitImage`'s own output then saved more than a tenth, so a second run compressed a stored photo again: `fit-image.spec.ts`'s "changes nothing the second time" test failed. With `'4:4:4'` it passes unchanged.
- **The transparent PNG is 2.2 times larger, for the same pixels.** jimp 2's PNG encoder compresses less well than 1.6.1's, whatever its options: the best found was 389 KB. The image is the same; only the hidden colour of fully transparent pixels differs. Accepted on #3755: transparent speaker photos are rare.
