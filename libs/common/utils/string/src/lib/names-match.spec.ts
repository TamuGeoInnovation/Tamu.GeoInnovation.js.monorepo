import { hasNameWords, namesMatch, normalizeName } from './names-match';

// A caller's own wording around a name, as GIS Day's memorial plaques use it.
const plaqueWording = new Set(['in', 'loving', 'memory', 'of', 'dedicated', 'to', 'dr', 'class']);

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

  it("matches a name with the caller's own wording around it, when told which words those are", () => {
    expect(namesMatch('In loving memory of Robert Hernandez', 'Robert Hernandez', plaqueWording)).toBe(true);
    expect(namesMatch('Dedicated to Dr. Susan Lee, Class of 1985', 'Susan Lee', plaqueWording)).toBe(true);
  });

  it('ignores no words unless told to', () => {
    expect(namesMatch('In loving memory of Robert Hernandez', 'Robert Hernandez')).toBe(true);
    expect(namesMatch('Memory Lane', 'Memory Lane', plaqueWording)).toBe(true);
    expect(namesMatch('In Memory', 'In Memory')).toBe(true);
  });

  it('does not match different people', () => {
    expect(namesMatch('John Smith', 'Jane Doe')).toBe(false);
    expect(namesMatch('Robert Hernandez', 'Roberta Fernandez')).toBe(false);
    expect(namesMatch('John Smith', 'Mary Smith')).toBe(false);
  });

  it('does not match on a surname alone, which many plaques share', () => {
    expect(namesMatch('Smith', 'John Smith')).toBe(false);
  });

  it('does not match when either name is missing, or has no words left to compare', () => {
    expect(namesMatch('', 'John Smith')).toBe(false);
    expect(namesMatch('John Smith', undefined)).toBe(false);
    expect(namesMatch(undefined, undefined)).toBe(false);
    expect(namesMatch('In loving memory', 'In loving memory', plaqueWording)).toBe(false);
  });
});

describe('hasNameWords', () => {
  it('is true for a name namesMatch can compare', () => {
    expect(hasNameWords('John Smith')).toBe(true);
    expect(hasNameWords('In loving memory of John Smith', plaqueWording)).toBe(true);
  });

  it('is false for nothing, punctuation, or only the words to ignore (#2424)', () => {
    expect(hasNameWords(undefined)).toBe(false);
    expect(hasNameWords(42)).toBe(false);
    expect(hasNameWords('  ...  ')).toBe(false);
    expect(hasNameWords('In loving memory', plaqueWording)).toBe(false);
    expect(hasNameWords('Dr.', plaqueWording)).toBe(false);
    expect(hasNameWords('Class of', plaqueWording)).toBe(false);
  });

  it('is false for a name in a script namesMatch cannot compare', () => {
    expect(hasNameWords('王小明')).toBe(false);
  });
});
