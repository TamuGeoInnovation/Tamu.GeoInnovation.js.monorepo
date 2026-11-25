import {
  IMPACT_DEFINITIONS,
  impactAccountWindows,
  impactCsv,
  impactReport,
  ImpactRows,
  impactTop,
  REPORTED_2025
} from './impact-report';

/** #3238. Made-up rows only: every id and email here is invented. */
function rows(over: Partial<ImpactRows> = {}): ImpactRows {
  const windows = impactAccountWindows(2026, ['2026-11-17', '2026-11-18'], ['2025-11-18', '2025-11-19']);

  return {
    year: 2026,
    days: ['2026-11-18', '2026-11-17'],
    accounts: windows.map((w, i) => ({ ...w, student: 10 + i, industry: 2, academia: 1, incomplete: 3, total: 16 + i })),
    speakers: [
      { guid: 's1', email: 'a@example.com', isOrganizer: false, organization: 'Acme Mapping', university: null, onActiveSession: true },
      // The same person copied twice into the season.
      { guid: 's2', email: 'A@example.com ', isOrganizer: false, organization: 'Acme Mapping', university: null, onActiveSession: true },
      { guid: 's3', email: 'b@example.com', isOrganizer: false, organization: 'acme  mapping', university: null, onActiveSession: false },
      { guid: 's4', email: null, isOrganizer: true, organization: null, university: 'Example University', onActiveSession: true },
      { guid: 's5', email: 'c@example.com', isOrganizer: false, organization: 'Survey Co', university: 'Example University', onActiveSession: true }
    ],
    checkIns: [
      { account: 'u1', session: 'e1', sessionTitle: 'Keynote', sessionActive: true, outsideSessionTime: false, organizer: false },
      { account: 'u1', session: 'e1', sessionTitle: 'Keynote', sessionActive: true, outsideSessionTime: false, organizer: false },
      { account: 'u2', session: 'e1', sessionTitle: 'Keynote', sessionActive: true, outsideSessionTime: true, organizer: false },
      { account: 'u3', session: 'e2', sessionTitle: 'Career fair', sessionActive: false, outsideSessionTime: false, organizer: true }
    ],
    submissions: [
      { type: 'presentation', level: 'undergraduate', accepted: true, reviewed: true },
      { type: 'presentation', level: 'graduate', accepted: false, reviewed: true },
      { type: 'poster', level: 'graduate', accepted: true, reviewed: true },
      { type: 'cartography', level: 'undergraduate', accepted: true, reviewed: false },
      { type: 'paper', level: 'graduate', accepted: true, reviewed: true }
    ],
    trail: [
      { person: 'u1', status: 'verified', personType: 'student' },
      { person: 'u1', status: 'unverified', personType: 'student' },
      { person: 'u4', status: 'discarded', personType: 'industry' },
      { person: 'u5', status: 'verified', personType: null }
    ],
    sessions: [
      { day: '2026-11-17', active: true },
      { day: '2026-11-17', active: true },
      { day: '2026-11-18', active: true },
      { day: '2026-11-18', active: false },
      { day: null, active: true }
    ],
    ...over
  };
}

describe('the impact report (#3238)', () => {
  it('offers the windows an account can count as created for a season in, from the season days', () => {
    const windows = impactAccountWindows(2026, ['2026-11-18', '2026-11-17'], ['2025-11-19', '2025-11-18']);
    const gisday = windows.find((w) => w.key === 'last-gisday-to-this-gisday');

    expect(gisday).toMatchObject({ from: '2025-11-20', to: '2026-11-18' });
    expect(windows.find((w) => w.key === 'calendar-year')).toMatchObject({ from: '2026-01-01', to: '2026-12-31' });
    expect(new Set(windows.map((w) => w.key)).size).toBe(windows.length);
  });

  it('counts the participants in the chosen window, by profile type', () => {
    const r = rows();
    const window = r.accounts.find((a) => a.key === IMPACT_DEFINITIONS.participants);

    expect(impactReport(r).participants).toEqual({
      students: window.student,
      industry: window.industry,
      academia: window.academia,
      incomplete: window.incomplete,
      total: window.total
    });
  });

  it('counts a speaker copied twice once, and an organization spelled two ways once', () => {
    const report = impactReport(rows());

    // a@ (twice), b@, the organizer with no email, c@.
    expect(report.speakers.speakers).toBe(4);
    // Acme Mapping and Survey Co: the organizer names a university only.
    expect(report.speakers.organizations).toBe(2);
    expect(report.speakers.topOrganizations[0]).toEqual({ rank: 1, name: 'Acme Mapping', count: 2 });
  });

  it('counts check-ins, and names the sessions with the most', () => {
    const report = impactReport(rows());

    expect(report.checkIns.total).toBe(4);
    expect(report.checkIns.topSessions).toEqual([
      { rank: 1, name: 'Keynote', count: 3 },
      { rank: 2, name: 'Career fair', count: 1 }
    ]);
    expect(report.alternatives['checkIns'].find((a) => a.key === 'during-not-organizers-each-once').value).toBe(1);
  });

  it('counts accepted research presentations and posters by level, cartography counted as a poster', () => {
    const report = impactReport(rows());

    expect(report.researchPresentations).toEqual({ total: 1, undergraduate: 1, graduate: 0 });
    expect(report.researchPosters).toEqual({ total: 2, undergraduate: 1, graduate: 1 });
  });

  it('counts every trail submission, and the students who made them', () => {
    expect(impactReport(rows()).trail).toEqual({ submissions: 4, students: 1, competitors: 3 });
  });

  it('counts active sessions by GIS Day day', () => {
    expect(impactReport(rows()).sessions).toEqual({
      total: 4,
      byDay: [
        { day: 1, date: '2026-11-17', sessions: 2 },
        { day: 2, date: '2026-11-18', sessions: 1 }
      ]
    });
  });

  it('writes out no account id, speaker id or email', () => {
    const text = JSON.stringify(impactReport(rows()));

    for (const secret of ['u1', 'u2', 'u4', 'u5', 's1', 's2', 'example.com']) {
      expect(text).not.toMatch(new RegExp(`"${secret}"|${secret.replace('.', '\\.')}`));
    }
  });

  it('for 2025, says which definitions reproduce the 2025 report and which measures none does', () => {
    const r = rows({ year: 2025 });
    r.trail = Array.from({ length: REPORTED_2025.trail.submissions }, (_, i) => ({
      person: `p${i % REPORTED_2025.trail.competitors}`,
      status: 'verified',
      personType: 'student' as const
    }));

    const report = impactReport(r);

    expect(report.alternatives['trail'].find((a) => a.key === 'all').matches2025).toBe(true);
    expect(report.unmatched2025).toContain('checkIns');
    expect(report.unmatched2025).not.toContain('trail');
    expect(report.reported2025).toEqual(REPORTED_2025);
    expect(impactReport(rows()).alternatives['trail'][0].matches2025).toBeUndefined();
  });

  it('ranks names case- and space-blind, ties by name', () => {
    expect(impactTop(['b', 'A', ' a ', 'B', 'c'], 2)).toEqual([
      { rank: 1, name: 'A', count: 2 },
      { rank: 2, name: 'b', count: 2 }
    ]);
  });

  it('compares two seasons as CSV: each measure with its change, and the top lists apart', () => {
    const earlier = impactReport(rows({ year: 2025 }));
    const later = impactReport(rows({ checkIns: rows().checkIns.slice(0, 2) }));
    const { measures, lists } = impactCsv(later, earlier);
    const lines = measures.trim().split('\r\n');

    expect(lines[0]).toBe('measure,2025,2026,change,percent change');
    expect(lines).toContain('Check-ins,4,2,-2,-50');
    expect(lines).toContain('Participants: incomplete profiles,3,3,0,0');
    expect(lines).toContain('Sessions: day 2,1,1,0,0');
    expect(lines.some((l) => l.startsWith('Participants: students,'))).toBe(true);
    expect(measures).not.toMatch(/Keynote|Acme/);

    const listLines = lists.trim().split('\r\n');
    expect(listLines[0]).toBe('list,rank,name,2025 count,2026 count');
    expect(listLines).toContain('Top sessions by check-ins,1,Keynote,3,2');
    expect(listLines).toContain('Top sessions by check-ins,2,Career fair,1,');
    expect(listLines).toContain('Top organizations by speakers,1,Acme Mapping,2,2');
  });

  it('quotes a name with a comma in a CSV', () => {
    const r = rows();
    r.checkIns = [{ ...r.checkIns[0], sessionTitle: 'Maps, apps and "data"' }];
    const { lists } = impactCsv(impactReport({ ...r, year: 2025 }), impactReport(r));

    expect(lists).toContain('"Maps, apps and ""data"""');
  });

  it('writes a name that starts as a formula as text (#3332)', () => {
    const r = rows();
    r.checkIns = [{ ...r.checkIns[0], sessionTitle: '=1+2' }];
    const { lists } = impactCsv(impactReport({ ...r, year: 2025 }), impactReport(r));

    expect(lists).toContain(`"'=1+2"`);
    expect(lists).not.toContain(',=1+2,');
  });
});
