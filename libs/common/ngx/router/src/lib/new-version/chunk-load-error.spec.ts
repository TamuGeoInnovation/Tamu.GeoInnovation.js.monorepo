import { isChunkLoadError } from './chunk-load-error';

describe('isChunkLoadError (#2945)', () => {
  it.each([
    ['Chrome and Edge', new TypeError('Failed to fetch dynamically imported module: https://txgisday.org/chunk-ABC123.js')],
    ['Firefox', new TypeError('error loading dynamically imported module: https://txgisday.org/chunk-ABC123.js')],
    ['Safari', new TypeError('Importing a module script failed.')],
    ['a webpack build, by message', new Error('Loading chunk 123 failed.')],
    ['a webpack build, by name', Object.assign(new Error('no chunk'), { name: 'ChunkLoadError' })]
  ])('recognises %s', (_browser, error) => {
    expect(isChunkLoadError(error)).toBe(true);
  });

  it.each([
    ['an HTTP error', new Error('Http failure response for /api/events: 500 Internal Server Error')],
    ['a script error', new TypeError("Cannot read properties of undefined (reading 'guid')")],
    ['nothing', undefined],
    ['null', null]
  ])('does not mistake %s for one', (_what, error) => {
    expect(isChunkLoadError(error)).toBe(false);
  });
});
