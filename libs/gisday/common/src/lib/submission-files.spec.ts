import { slidesZipName, zipSafe } from './submission-files';

/** #3174: what a session's slides, downloaded together, are saved as, and the names inside a zip. */
describe('zip names', () => {
  it('keeps a name Windows can save: no slashes, colons or quotes, one space between words', () => {
    expect(zipSafe('Floods: a/b  "study"\n', 'x')).toBe('Floods a b study');
    // A backslash too, which Windows reads as a folder.
    expect(zipSafe('Rivers\\Lakes', 'x')).toBe('Rivers Lakes');
  });

  it('falls back when nothing is left, and cuts a long name at 80', () => {
    expect(zipSafe(' :/ ', 'A speaker')).toBe('A speaker');
    expect(zipSafe(null, 'session')).toBe('session');
    expect(zipSafe('a'.repeat(100), 'x')).toHaveLength(80);
  });

  it("names a session's slides for the session", () => {
    expect(slidesZipName('Panel: Mapping Texas floods')).toBe('Panel Mapping Texas floods - slides.zip');
    expect(slidesZipName(undefined)).toBe('session - slides.zip');
  });
});
