import { institutionKey, institutionsToAdd, planMembers, UCGIS_MEMBER_INSTITUTIONS } from './ucgis-members';

/**
 * #2721. The script adds every UCGIS member a GIS Day database does not have, and nothing it already has under another
 * spelling.
 */
describe('UCGIS member institutions', () => {
  it('lists each institution once', () => {
    const keys = UCGIS_MEMBER_INSTITUTIONS.flatMap((m) => [m.name, ...(m.alsoKnownAs ?? [])]).map(institutionKey);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('treats spellings that differ only in case, "The", "&" spacing or punctuation as one institution', () => {
    expect(institutionKey('The Ohio State University')).toBe(institutionKey('Ohio State University'));
    expect(institutionKey('Texas A & M University')).toBe(institutionKey('Texas A&M University'));
    expect(institutionKey('Texas A&M University-Corpus Christi')).toBe(institutionKey('Texas A&M University Corpus Christi'));
    expect(institutionKey('University of Wisconsin - Madison')).toBe(institutionKey('University of Wisconsin-Madison'));
    expect(institutionKey('University of Massachusetts, Amherst ')).toBe(institutionKey('University of Massachusetts Amherst'));
  });

  it('adds every member to an empty list', () => {
    expect(institutionsToAdd([]).map((m) => m.name)).toEqual(UCGIS_MEMBER_INSTITUTIONS.map((m) => m.name));
  });

  it('does not add a member that is already there under another spelling', () => {
    // As the databases had them on 8 November 2026.
    const existing = [
      'Clemson',
      'Ohio State University',
      'Pennsylvania State University',
      'Texas A&M University',
      'Texas A&M University Corpus Christi',
      'University of California at Santa Barbara',
      'University of Illinois Urbana-Champaign',
      'University of Tennessee Knoxville',
      'University of Wisconsin-Madison',
      null
    ];
    const added = institutionsToAdd(existing).map((m) => m.name);

    for (const name of [
      'Clemson University',
      'The Ohio State University',
      'Penn State University',
      'Texas A&M University',
      'Texas A&M University-Corpus Christi',
      'University of California, Santa Barbara',
      'University of Illinois Urbana-Champaign',
      'University of Wisconsin-Madison'
    ]) {
      expect(added).not.toContain(name);
    }
    expect(added).toContain('Yale University');
  });

  it('does not take one campus for another', () => {
    const added = institutionsToAdd(['University of Maryland, Baltimore County', 'University of Wisconsin Milwaukee']).map(
      (m) => m.name
    );

    expect(added).toContain('University of Maryland');
    expect(added).toContain('University of Wisconsin-Madison');
  });

  it('adds nothing the second time', () => {
    const first = institutionsToAdd(['Rutgers University']).map((m) => m.name);

    expect(institutionsToAdd(['Rutgers University', ...first])).toEqual([]);
  });

  it('plans what it would add and under what spelling the rest are already there (#2730)', () => {
    const plan = planMembers(['Clemson', 'Yale University', '  ', null]);

    expect(plan.keep).toEqual([
      { name: 'Clemson University', as: 'Clemson' },
      { name: 'Yale University', as: 'Yale University' }
    ]);
    expect(plan.add).not.toContain('Clemson University');
    expect(plan.add).not.toContain('Yale University');
    expect(plan.add.length + plan.keep.length).toBe(UCGIS_MEMBER_INSTITUTIONS.length);
  });
});
