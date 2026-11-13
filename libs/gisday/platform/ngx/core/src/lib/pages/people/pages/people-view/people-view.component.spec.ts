import { compareByLastName, matchesSearch, presenterCount } from './people-view.component';

const person = (firstName: string, lastName: string, organization?: string, university?: [string, string]) => ({
  firstName,
  lastName,
  organization: organization ? ({ name: organization } as never) : undefined,
  university: university ? ({ name: university[0], acronym: university[1] } as never) : undefined
});

describe('Presenters', () => {
  /** #2860: by last name, then first name, without regard to case or accents. */
  it('lists presenters by last name, then first name', () => {
    const sorted = [person('Zoe', 'Adams'), person('Aaron', 'Pearce'), person('Ana', 'adams'), person('Émile', 'Ábel')].sort(
      compareByLastName
    );

    expect(sorted.map((p) => `${p.firstName} ${p.lastName}`)).toEqual(['Émile Ábel', 'Ana adams', 'Zoe Adams', 'Aaron Pearce']);
  });

  /** #2859: first name, last name, full name or organization, any case, accents ignored. */
  describe('search', () => {
    const alanna = person('Alanna', 'Jajeh', 'Freese & Nichols');

    it.each([['alanna'], ['JAJEH'], ['alanna jaj'], ['freese'], ['  nichols ']])('finds a presenter by "%s"', (text) => {
      expect(matchesSearch(alanna, text)).toBe(true);
    });

    it('ignores accents', () => {
      expect(matchesSearch(person('José', 'Landívar'), 'jose landivar')).toBe(true);
    });

    it('shows everyone for an empty search, and no one for text nobody has', () => {
      expect(matchesSearch(alanna, '')).toBe(true);
      expect(matchesSearch(alanna, 'esri')).toBe(false);
    });

    /** #2869: the presenter's university, by its full name or its abbreviation. */
    it.each([['texas a&m university'], ['Texas A&M'], ['TAMU'], ['tamu ']])('finds a presenter by university, "%s"', (text) => {
      expect(matchesSearch(person('Ana', 'Ruiz', 'City of Austin', ['Texas A&M University', 'TAMU']), text)).toBe(true);
    });

    it('finds no one by university when the presenter has none', () => {
      expect(matchesSearch(person('Ana', 'Ruiz', 'City of Austin'), 'tamu')).toBe(false);
    });
  });

  /** #2870: how many presenters the list holds, under it, with or without a search. */
  describe('count', () => {
    it('gives the total with no search', () => {
      expect(presenterCount(78, 78, '')).toBe('78 presenters');
      expect(presenterCount(1, 1, ' ')).toBe('1 presenter');
    });

    it('gives how many of the total a search shows', () => {
      expect(presenterCount(5, 78, 'tamu')).toBe('Showing 5 of 78 presenters');
      expect(presenterCount(0, 78, 'zzz')).toBe('Showing 0 of 78 presenters');
    });
  });
});
