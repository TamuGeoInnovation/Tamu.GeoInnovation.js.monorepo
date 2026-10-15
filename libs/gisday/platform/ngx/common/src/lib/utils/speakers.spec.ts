import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

import { isAggieFormerStudent, shortClassYear, sortSpeakersByAffiliation, speakerAffiliation } from './speakers';

const person = (firstName: string, lastName: string, organization?: string, affiliation?: string) =>
  ({ firstName, lastName, organization: organization ? { name: organization } : null, affiliation }) as Partial<Speaker>;

describe('shortClassYear', () => {
  it('writes a four- or two-digit year as a class year', () => {
    expect(shortClassYear('2014')).toBe("'14");
    expect(shortClassYear('22')).toBe("'22");
    expect(shortClassYear(' 1995 ')).toBe("'95");
  });

  it('keeps every year of a record that holds more than one', () => {
    expect(shortClassYear('2019, 2021')).toBe("'19, '21");
    expect(shortClassYear('2019 and 2021')).toBe("'19, '21");
  });

  it('is empty for no year or something that is not one', () => {
    expect(shortClassYear(null)).toBe('');
    expect(shortClassYear(undefined)).toBe('');
    expect(shortClassYear('')).toBe('');
    expect(shortClassYear('Spring')).toBe('');
  });
});

describe('isAggieFormerStudent', () => {
  it('is true for Texas A&M with a class year', () => {
    expect(isAggieFormerStudent({ university: { acronym: 'TAMU' }, graduationYear: '2014' } as Partial<Speaker>)).toBe(true);
    expect(isAggieFormerStudent({ university: { acronym: ' tamu ' }, graduationYear: '2014' } as Partial<Speaker>)).toBe(true);
  });

  it('is false for another university, no university or no year', () => {
    expect(isAggieFormerStudent({ university: { acronym: 'LSU' }, graduationYear: '2022' } as Partial<Speaker>)).toBe(false);
    expect(isAggieFormerStudent({ university: null, graduationYear: '1995' } as Partial<Speaker>)).toBe(false);
    expect(isAggieFormerStudent({ university: { acronym: 'TAMU' }, graduationYear: '' } as Partial<Speaker>)).toBe(false);
    expect(isAggieFormerStudent(undefined)).toBe(false);
  });
});

describe('speakerAffiliation', () => {
  it('is the organization, falling back to the free-text affiliation', () => {
    expect(speakerAffiliation(person('A', 'B', 'ConocoPhillips', 'ignored'))).toBe('ConocoPhillips');
    expect(speakerAffiliation(person('A', 'B', undefined, ' Lenovo '))).toBe('Lenovo');
    expect(speakerAffiliation(person('A', 'B'))).toBe('');
  });
});

describe('sortSpeakersByAffiliation', () => {
  it('groups people from the same company, then orders them by last and first name', () => {
    const sorted = sortSpeakersByAffiliation([
      person('Keith', 'Fraley', 'Pattern Energy'),
      person('Christian', 'McLellan', 'ConocoPhillips'),
      person('Alex', 'Malito', 'Pattern Energy'),
      person('Benjamin', 'Lybrand', 'ConocoPhillips'),
      person('Ann', 'Lybrand', 'conocophillips')
    ]);

    expect(sorted.map((s) => `${s.firstName} ${s.lastName}`)).toEqual([
      'Ann Lybrand',
      'Benjamin Lybrand',
      'Christian McLellan',
      'Keith Fraley',
      'Alex Malito'
    ]);
  });

  it('puts people with no affiliation last', () => {
    const sorted = sortSpeakersByAffiliation([person('Zed', 'Alone'), person('Amy', 'Zimmer', 'Esri')]);

    expect(sorted.map((s) => s.lastName)).toEqual(['Zimmer', 'Alone']);
  });

  it('leaves the list it was given untouched', () => {
    const given = [person('B', 'B', 'Z'), person('A', 'A', 'A')];

    sortSpeakersByAffiliation(given);

    expect(given.map((s) => s.lastName)).toEqual(['B', 'A']);
    expect(sortSpeakersByAffiliation(null)).toEqual([]);
  });
});
