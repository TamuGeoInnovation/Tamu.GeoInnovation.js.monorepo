import { byFirstAuthor } from './judging';
import { lastNameOf } from './names';

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
