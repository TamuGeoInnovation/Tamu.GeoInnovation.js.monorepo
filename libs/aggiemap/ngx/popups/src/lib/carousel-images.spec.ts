import { carouselImageUrls } from './carousel-images';

const BASE = 'https://aggiemap.tamu.edu/images/cb';

describe('carouselImageUrls', () => {
  it("builds a URL for every name in Points of Interest's format", () => {
    expect(carouselImageUrls('Bonfire_memorial_sky.jpg,Bonfire_night.jpg')).toEqual([
      `${BASE}/Bonfire_memorial_sky.jpg`,
      `${BASE}/Bonfire_night.jpg`
    ]);
  });

  // Nature Rx writes `a.jpg, b.jpg` where Points of Interest writes `a.jpg,b.jpg`. A bare split on the
  // comma leaves the space on every name after the first, and those images do not load (#2630).
  it("trims the spaces in Nature Rx's format, so the second image is requested by name", () => {
    expect(carouselImageUrls('Aggie_Park1.jpg, Aggie_Park2.jpg, Aggie_Park3.jpg')).toEqual([
      `${BASE}/Aggie_Park1.jpg`,
      `${BASE}/Aggie_Park2.jpg`,
      `${BASE}/Aggie_Park3.jpg`
    ]);
  });

  it('keeps a single image', () => {
    expect(carouselImageUrls('EastQuad1.jpg')).toEqual([`${BASE}/EastQuad1.jpg`]);
  });

  // A trailing comma would otherwise become a request for the folder itself, which answers with
  // something that is not an image and leaves a broken frame in the carousel.
  it('drops an empty name rather than requesting the folder', () => {
    expect(carouselImageUrls('DiscGolf1.jpg, ,DiscGolf2.jpg,')).toEqual([
      `${BASE}/DiscGolf1.jpg`,
      `${BASE}/DiscGolf2.jpg`
    ]);
  });

  it('has no images when the field is empty, null or undefined', () => {
    expect(carouselImageUrls('')).toEqual([]);
    expect(carouselImageUrls(null)).toEqual([]);
    expect(carouselImageUrls(undefined)).toEqual([]);
    expect(carouselImageUrls(' , , ')).toEqual([]);
  });
});
