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

| Output | 1.6.1 | 2.2.0 | Pixels, decoded by the same decoder |
| --- | --- | --- | --- |
| `photo.jpg` | 411,372 bytes | 390,033 bytes | mean channel difference 1.5, max 35; 3.1% of pixels off by more than 8 |
| `photo-exif6.jpg` | 410,950 bytes, 1120 x 840 | 389,559 bytes, 1120 x 840 | the same as above; rotated the same way, EXIF removed by both |
| `background.jpg` | 317,654 bytes | 264,106 bytes | mean 1.5, max 60; 7.1% of pixels off by more than 8 |
| `screenshot.jpg` | 157,548 bytes | 117,843 bytes | mean 2.8, max 131; 28% of pixels off by more than 8, at the edges of coloured text |
| `transparent.png` | 200,452 bytes | 436,676 bytes | the same image: alpha identical everywhere; on white, at most 1.7 levels apart |

None matches byte for byte. Why:

- **JPEGs are smaller and softer in colour.** From 2.1.0, jimp halves the resolution of the colour channels (4:2:0 chroma subsampling) below quality 90; 1.6.1 kept them whole. Photos barely change; sharp coloured edges, as in a screenshot, do. It also writes a 3 KB sRGB ICC profile (not personal metadata). Passing `chromaSubsampling: '4:4:4'` brings the sizes back within 2% of 1.6.1, but not to the same bytes: the encoder is jimp's own `@jimp/jpeg-js` now, not `jpeg-js`.
- **The transparent PNG is 2.2 times larger, for the same pixels.** jimp 2's PNG encoder compresses less well than 1.6.1's, whatever its options: the best found was 389 KB. The image is the same; only the hidden colour of fully transparent pixels differs.
