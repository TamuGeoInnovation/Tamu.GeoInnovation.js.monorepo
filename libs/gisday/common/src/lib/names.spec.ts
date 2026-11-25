import { byFirstAuthor } from './judging';
import { byName, lastNameOf, naturalOrder } from './names';

describe('lastNameOf', () => {
  it('is the name less the first name when it starts with it, or else its last word', () => {
    expect(lastNameOf('Mary Ann Brown', 'Mary Ann')).toBe('Brown');
    expect(lastNameOf('Avery van Example')).toBe('Example');
    expect(lastNameOf('  Casey Test  ')).toBe('Test');
    expect(lastNameOf('')).toBe('');
    expect(lastNameOf(null)).toBe('');
  });
});

/** #3200: a judge's entries by their first author's last name. Every person here is made up. */
describe('byFirstAuthor', () => {
  const entry = (title: string, ...presenters: Array<string>) => ({ title, presenters });

  it("orders by the first author's last name, ignoring case and accents, then the name, then the title", () => {
    const sorted = byFirstAuthor([
      entry('Zebra', 'Morgan Young', 'Avery Adams'),
      entry('Ice', 'Jordan Álvarez'),
      entry('Hills', 'casey baker'),
      entry('Dunes', 'Blake Baker'),
      entry('Caves', 'Blake Baker')
    ]);

    expect(sorted.map((e) => e.title)).toEqual(['Ice', 'Caves', 'Dunes', 'Hills', 'Zebra']);
  });

  it('puts an entry with no authors last, and leaves the list it was given as it was', () => {
    const given = [entry('No one'), entry('Rivers', 'Casey Test')];

    expect(byFirstAuthor(given).map((e) => e.title)).toEqual(['Rivers', 'No one']);
    expect(given.map((e) => e.title)).toEqual(['No one', 'Rivers']);
    expect(byFirstAuthor(null)).toEqual([]);
  });
});

/**
 * One order for names everywhere, on the site and in the API (#3331): case and accents ignored, numbers as numbers. Ten
 * sorts each chose their own options, so one list could sort one way on screen and another in an email.
 */
describe('naturalOrder and byName', () => {
  it('compares names as a reader would: case and accents ignored, numbers as numbers', () => {
    const names = ['Team 10', 'josé', 'Team 2', 'Jose', 'ana'];

    expect([...names].sort(naturalOrder.compare)).toEqual(['ana', 'josé', 'Jose', 'Team 2', 'Team 10']);
  });

  it('sorts rows by name, a blank one last, in a copy', () => {
    const rows = [{ name: ' Team 10' }, { name: '' }, { name: 'Team 2 ' }];

    expect(byName(rows).map((r) => r.name)).toEqual(['Team 2 ', ' Team 10', '']);
    expect(rows[0].name).toBe(' Team 10');
  });

  it("sorts a judge's entries by first author in that order too", () => {
    const entries = [
      { title: 'B', presenters: ['Team 10'] },
      { title: 'A', presenters: ['Team 2'] }
    ];

    expect(byFirstAuthor(entries).map((e) => e.presenters[0])).toEqual(['Team 2', 'Team 10']);
  });
});
