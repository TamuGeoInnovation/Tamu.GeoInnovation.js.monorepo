import { foldedText, matchesText } from './search-text';

describe('matchesText()', () => {
  it('finds the search in any field, ignoring case and accents, and matches everything for an empty search', () => {
    expect(matchesText(['José Ortiz', 'Esri'], 'jose')).toBe(true);
    expect(matchesText(['José Ortiz', null], 'ESRI')).toBe(false);
    expect(matchesText([null], '  ')).toBe(true);
  });
});

describe('foldedText()', () => {
  it('lowers case and drops accents', () => {
    expect(foldedText('Zoë ÉLAN')).toBe('zoe elan');
    expect(foldedText(null)).toBe('');
  });
});
