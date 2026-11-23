import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

import { classBannerSpeaker, isAggieFormerStudent, shortClassYear, speakerAffiliation } from './speakers';

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

describe('classBannerSpeaker (#2956)', () => {
  const universities = [
    { guid: 'u-1', acronym: 'ESU', hexTriplet: '500000' },
    { guid: 'u-2', acronym: 'STECH', hexTriplet: '0039a6' }
  ];

  it('finds the chosen university in the list, with the year typed', () => {
    expect(classBannerSpeaker('u-2', '2018', universities)).toEqual({ university: universities[1], graduationYear: '2018' });
  });

  it('has no university when none is chosen, the one chosen is not in the list, or the list has not loaded', () => {
    expect(classBannerSpeaker('', '2018', universities).university).toBeNull();
    expect(classBannerSpeaker(null, '2018', universities).university).toBeNull();
    expect(classBannerSpeaker('u-9', '2018', universities).university).toBeNull();
    expect(classBannerSpeaker('u-1', '2018', null).university).toBeNull();
  });

  it('gives a missing year as an empty string', () => {
    expect(classBannerSpeaker('u-1', null, universities).graduationYear).toBe('');
  });
});

describe('isAggieFormerStudent', () => {
  it('is true for Texas A&M with a class year', () => {
    expect(isAggieFormerStudent({ university: { acronym: 'TAMU' }, graduationYear: '2014' } as Partial<Speaker>)).toBe(true);
    expect(isAggieFormerStudent({ university: { acronym: ' tamu ' }, graduationYear: '2014' } as Partial<Speaker>)).toBe(
      true
    );
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
