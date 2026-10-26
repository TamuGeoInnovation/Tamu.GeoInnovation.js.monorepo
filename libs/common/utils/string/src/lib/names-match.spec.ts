import { namesMatch, normalizeName } from './names-match';

describe('normalizeName', () => {
  it('ignores case, accents, punctuation and spacing', () => {
    expect(normalizeName("  José  O'Brien-Smith, Jr. ")).toBe('jose o brien smith jr');
  });

  it('gives an empty string for nothing', () => {
    expect(normalizeName(undefined)).toBe('');
    expect(normalizeName(null)).toBe('');
    expect(normalizeName('  ...  ')).toBe('');
  });
});

describe('namesMatch', () => {
  it('matches the same name typed differently', () => {
    expect(namesMatch('John A. Smith', 'john a smith')).toBe(true);
    expect(namesMatch('Mary-Ellen Jones', 'Mary Ellen Jones')).toBe(true);
  });

  it('matches a small typing mistake', () => {
    expect(namesMatch('Katherine Montgomery', 'Katherine Montgomrey')).toBe(true);
    expect(namesMatch('Robert Hernandez', 'Robert Hernandes')).toBe(true);
  });

  it("matches a name with the plaque's own wording around it", () => {
    expect(namesMatch('In loving memory of Robert Hernandez', 'Robert Hernandez')).toBe(true);
    expect(namesMatch('Dedicated to Dr. Susan Lee, Class of 1985', 'Susan Lee')).toBe(true);
  });

  it('does not match different people', () => {
    expect(namesMatch('John Smith', 'Jane Doe')).toBe(false);
    expect(namesMatch('Robert Hernandez', 'Roberta Fernandez')).toBe(false);
    expect(namesMatch('John Smith', 'Mary Smith')).toBe(false);
  });

  it('does not match on a surname alone, which many plaques share', () => {
    expect(namesMatch('Smith', 'John Smith')).toBe(false);
  });

  it('does not match when either name is missing', () => {
    expect(namesMatch('', 'John Smith')).toBe(false);
    expect(namesMatch('John Smith', undefined)).toBe(false);
    expect(namesMatch(undefined, undefined)).toBe(false);
  });
});
