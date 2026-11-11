import { compareByLastName, matchesSearch } from './people-view.component';

const person = (firstName: string, lastName: string, organization?: string) => ({
  firstName,
  lastName,
  organization: organization ? ({ name: organization } as never) : undefined
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
  });
});
