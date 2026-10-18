import { actingAsProduction } from './acting-as-production';

/** A stand-in for `sessionStorage`. */
function session(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> & { values: Map<string, string> } {
  const values = new Map<string, string>();

  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key)
  };
}

describe('acting as production (#1722)', () => {
  it('is off unless asked for', () => {
    expect(actingAsProduction({ search: '' }, session())).toBe(false);
    expect(actingAsProduction({ search: '?bldg=0468' }, session())).toBe(false);
  });

  it('is turned on by ?as=production', () => {
    expect(actingAsProduction({ search: '?as=production' }, session())).toBe(true);
    expect(actingAsProduction({ search: '?bldg=0468&as=production' }, session())).toBe(true);
  });

  it('stays on for the tab when the next address no longer carries it', () => {
    // Moving between maps drops query parameters, so without this the switch is lost on the first click.
    const tab = session();

    actingAsProduction({ search: '?as=production' }, tab);

    expect(actingAsProduction({ search: '' }, tab)).toBe(true);
    expect(actingAsProduction({ search: '?event-day=day1' }, tab)).toBe(true);
  });

  it('is turned off by ?as=development, and stays off', () => {
    const tab = session();

    actingAsProduction({ search: '?as=production' }, tab);

    expect(actingAsProduction({ search: '?as=development' }, tab)).toBe(false);
    expect(actingAsProduction({ search: '' }, tab)).toBe(false);
  });

  it('ignores any other value', () => {
    const tab = session();

    expect(actingAsProduction({ search: '?as=staging' }, tab)).toBe(false);
    expect(actingAsProduction({ search: '?as=' }, tab)).toBe(false);
    expect(tab.values.size).toBe(0);
  });

  it('still answers from the address where the browser refuses storage', () => {
    const refusing = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => {
        throw new Error('denied');
      }
    };

    expect(actingAsProduction({ search: '?as=production' }, refusing)).toBe(true);
    expect(actingAsProduction({ search: '' }, refusing)).toBe(false);
    expect(actingAsProduction({ search: '?as=production' }, undefined)).toBe(true);
  });
});
