import { foldedText, matchesText, sessionSearchFields } from './search-text';

describe('sessionSearchFields()', () => {
  it("gives a session's name, building, room and presenters, and tolerates any of them missing (#2944)", () => {
    expect(
      sessionSearchFields({
        name: 'Mapathon',
        location: { building: 'Evans Library', room: '204' },
        presenters: ['Ana Ruiz', 'José Ortiz']
      })
    ).toEqual(['Mapathon', 'Evans Library', '204', 'Ana Ruiz', 'José Ortiz']);
    expect(sessionSearchFields({ name: 'Mapathon', location: null })).toEqual(['Mapathon', undefined, undefined]);
  });
});

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
