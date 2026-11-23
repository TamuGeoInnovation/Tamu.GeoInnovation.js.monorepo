/**
 * The GIS Day impact report's counts (#3238): one season's numbers, by definitions kept here so every season is counted
 * the same way and two seasons compare.
 *
 * Nothing here reads a database or Auth0. The production run (the operations repository's GIS Day `data/` folder,
 * `impact-report.ps1`) reads the rows as the maintainer's admin account and hands them to
 * `apps/gisday-nest/src/scripts/impact-report.ts`, which calls these functions. That keeps production credentials out
 * of this repository, as `add-ucgis-members` does (#2730).
 *
 * A row may carry an account or speaker id, so a person is counted once, but **no output does**: a report holds counts,
 * and the names of organizations and sessions only.
 *
 * Each measure is counted under every definition in its `alternatives`, and the one the report uses is named in
 * `IMPACT_DEFINITIONS`. For 2025 each alternative also says whether it reproduces the number the 2025 report gave
 * (`REPORTED_2025`), which is how the definitions were chosen (decided 3A on #3238).
 */

/** The profile types a GIS Day account signs up as (`app_metadata.gisday.attendeeType` in Auth0). */
export type ImpactProfileType = 'student' | 'industry' | 'academia';

/** A window in which accounts count as created for a season. */
export interface ImpactAccountWindow {
  key: string;
  definition: string;
  /** Inclusive, `YYYY-MM-DD`, in Central time. */
  from: string;
  /** Inclusive, `YYYY-MM-DD`, in Central time. */
  to: string;
}

/** How many accounts Auth0 has created in a window, by profile type. Counted by Auth0, so no account is read. */
export interface ImpactAccountCounts extends ImpactAccountWindow {
  student: number;
  industry: number;
  academia: number;
  /** An account with no profile type. */
  incomplete: number;
  total: number;
}

/** A speaker on at least one of the season's sessions. */
export interface ImpactSpeakerRow {
  guid: string;
  /** Only to count a speaker copied twice into one season once. Never written out. */
  email: string | null;
  isOrganizer: boolean;
  organization: string | null;
  university: string | null;
  /** Whether at least one of their sessions is active (shown on the site). */
  onActiveSession: boolean;
}

/** One check-in to one of the season's sessions. */
export interface ImpactCheckInRow {
  /** Only to count a person once. Never written out. */
  account: string;
  session: string;
  sessionTitle: string;
  sessionActive: boolean;
  outsideSessionTime: boolean;
  /** Whether the account is one of the season's organizers. */
  organizer: boolean;
}

/** A research competition submission (`submissions`). */
export interface ImpactSubmissionRow {
  /** `presentation`, `poster`, `paper` or `cartography`. */
  type: string | null;
  /** `undergraduate` or `graduate`. */
  level: string | null;
  accepted: boolean;
  reviewed: boolean;
}

/** A trail challenge submission (`vgi_submissions`). */
export interface ImpactTrailRow {
  /** Only to count a person once. Never written out. */
  person: string;
  /** `verified`, `unverified` or `discarded`. */
  status: string | null;
  /** How the submitter signed up, or null when the account is gone or never said. */
  personType: ImpactProfileType | null;
}

/** One of the season's sessions. */
export interface ImpactSessionRow {
  /** Its day, `YYYY-MM-DD`, or null when it has none. */
  day: string | null;
  active: boolean;
}

/** Everything one season's report is counted from. */
export interface ImpactRows {
  year: number;
  /** The season's days, `YYYY-MM-DD`. */
  days: Array<string>;
  accounts: Array<ImpactAccountCounts>;
  speakers: Array<ImpactSpeakerRow>;
  checkIns: Array<ImpactCheckInRow>;
  submissions: Array<ImpactSubmissionRow>;
  trail: Array<ImpactTrailRow>;
  sessions: Array<ImpactSessionRow>;
}

/** One way of counting a measure, and what it gives. */
export interface ImpactAlternative {
  key: string;
  definition: string;
  value: number | Record<string, number>;
  /** 2025 only: whether this definition gives the number the 2025 report did. */
  matches2025?: boolean;
}

export interface ImpactNamedCount {
  rank: number;
  name: string;
  count: number;
}

export interface ImpactReport {
  year: number;
  /** The definition each number below is counted by, in words. */
  definitions: Record<string, string>;
  participants: { students: number; industry: number; academia: number; incomplete: number; total: number };
  speakers: { speakers: number; organizations: number; topOrganizations: Array<ImpactNamedCount> };
  checkIns: { total: number; topSessions: Array<ImpactNamedCount> };
  researchPresentations: { total: number; undergraduate: number; graduate: number };
  researchPosters: { total: number; undergraduate: number; graduate: number };
  trail: { submissions: number; students: number; competitors: number };
  sessions: { total: number; byDay: Array<{ day: number; date: string; sessions: number }> };
  /** Every definition tried for each measure, with its count. */
  alternatives: Record<string, Array<ImpactAlternative>>;
  /** 2025 only: the numbers the 2025 report gave, and which measures no definition here reproduces. */
  reported2025?: typeof REPORTED_2025;
  unmatched2025?: Array<string>;
}

/**
 * What the 2025 impact report gave, from the maintainer (23 November 2026). The definitions are chosen to reproduce
 * these where the data allows.
 */
export const REPORTED_2025 = {
  participants: { students: 922, industry: 88, academia: 48, incomplete: 108, total: 1166 },
  speakers: 167,
  organizations: 45,
  checkIns: 1580,
  researchPresentations: { total: 20, undergraduate: 9, graduate: 11 },
  researchPosters: { total: 24, undergraduate: 18, graduate: 6 },
  trail: { submissions: 1233, competitors: 13 }
};

/**
 * The definition each measure is counted by: a key of that measure's alternatives. Change one here, never in a single
 * season's run, so every season stays comparable.
 *
 * Set from the first production run, 23 November 2026 (#3238). No definition reproduced the 2025 report's number for any
 * measure but the trail's person count, so each is the closest that reads plainly: every speaker on a session, each
 * once; the organizations they name; every check-in; accepted research presentations, and accepted posters with the
 * cartography entries; every trail submission. What 2025 reported, and why it differs, is on #3238.
 */
export const IMPACT_DEFINITIONS = {
  participants: 'last-gisday-to-this-gisday',
  speakers: 'by-email',
  organizations: 'organizations',
  checkIns: 'all',
  researchPresentations: 'all-accepted',
  researchPosters: 'posters-and-cartography-accepted',
  trail: 'all'
} as const;

/** How many organizations and sessions the top lists name. */
export const IMPACT_TOP = 10;

/**
 * The windows in which an account counts as created for a season, tried against 2025's participants (decided 2A on
 * #3238). `days` are the season's GIS Day days and `previousDays` the season before's; with none, its year's November.
 */
export function impactAccountWindows(year: number, days: Array<string>, previousDays: Array<string>): Array<ImpactAccountWindow> {
  const first = (d: Array<string>, fallback: string) => [...d].sort()[0] ?? fallback;
  const last = (d: Array<string>, fallback: string) => [...d].sort().reverse()[0] ?? fallback;
  const dayAfter = (date: string) => {
    const d = new Date(`${date}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const thisEnd = last(days, `${year}-11-30`);
  const previousEnd = last(previousDays, `${year - 1}-11-30`);

  return [
    { key: 'calendar-year', definition: `Created in the calendar year ${year}`, from: `${year}-01-01`, to: `${year}-12-31` },
    {
      key: 'last-gisday-to-this-gisday',
      definition: "Created after the previous season's GIS Day, through the last day of this season's",
      from: dayAfter(previousEnd),
      to: thisEnd
    },
    {
      key: 'last-gisday-to-year-end',
      definition: "Created after the previous season's GIS Day, through 31 December",
      from: dayAfter(previousEnd),
      to: `${year}-12-31`
    },
    {
      key: 'school-year',
      definition: `Created in the school year that holds GIS Day, 1 August ${year} to 31 July ${year + 1}`,
      from: `${year}-08-01`,
      to: `${year + 1}-07-31`
    },
    {
      key: 'year-start-to-gisday',
      definition: `Created from 1 January ${year} through the last day of GIS Day`,
      from: `${year}-01-01`,
      to: thisEnd
    },
    {
      key: 'school-year-to-gisday',
      definition: `Created from 1 August ${year - 1} through the last day of GIS Day`,
      from: `${year - 1}-08-01`,
      to: thisEnd
    },
    {
      key: 'previous-gisday-start-to-gisday',
      definition: "Created from the first day of the previous season's GIS Day through the last day of this season's",
      from: first(previousDays, `${year - 1}-11-01`),
      to: thisEnd
    }
  ];
}

const normal = (s: string | null | undefined) => (s ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
const distinct = <T>(rows: Array<T>, key: (row: T) => string) => new Set(rows.map(key)).size;

/** The top `IMPACT_TOP` of a list of names, by how often each appears, ties by name. */
export function impactTop(names: Array<string>, top = IMPACT_TOP): Array<ImpactNamedCount> {
  const counts = new Map<string, { name: string; count: number }>();

  for (const name of names) {
    const key = normal(name);

    if (!key) {
      continue;
    }

    const entry = counts.get(key) ?? { name: name.trim().replace(/\s+/g, ' '), count: 0 };
    entry.count++;
    counts.set(key, entry);
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, top)
    .map((e, i) => ({ rank: i + 1, ...e }));
}

const byLevel = (rows: Array<ImpactSubmissionRow>) => ({
  total: rows.length,
  undergraduate: rows.filter((r) => normal(r.level) === 'undergraduate').length,
  graduate: rows.filter((r) => normal(r.level) === 'graduate').length
});

/** One season's report, counted from its rows. */
export function impactReport(rows: ImpactRows): ImpactReport {
  const is2025 = rows.year === 2025;
  const alternatives: Record<string, Array<ImpactAlternative>> = {};

  /** Records every alternative of a measure, flags those reproducing 2025's number, and returns the chosen one. */
  function choose<T extends number | Record<string, number>>(
    measure: string,
    chosen: string,
    options: Array<{ key: string; definition: string; value: T; rows?: unknown }>,
    reported?: T
  ): { value: T; definition: string; rows?: unknown } {
    alternatives[measure] = options.map((o) => ({
      key: o.key,
      definition: o.definition,
      value: o.value,
      ...(is2025 && reported !== undefined ? { matches2025: JSON.stringify(o.value) === JSON.stringify(reported) } : {})
    }));

    const pick = options.find((o) => o.key === chosen);

    if (!pick) {
      throw new Error(`No definition "${chosen}" for ${measure}.`);
    }

    return pick;
  }

  // 1. Participants
  const participants = choose(
    'participants',
    IMPACT_DEFINITIONS.participants,
    rows.accounts.map((a) => ({
      key: a.key,
      definition: `${a.definition} (${a.from} to ${a.to})`,
      value: { students: a.student, industry: a.industry, academia: a.academia, incomplete: a.incomplete, total: a.total }
    })),
    REPORTED_2025.participants
  );

  // 2. Speakers and the groups they come from
  const onActive = rows.speakers.filter((s) => s.onActiveSession);
  const byEmail = (s: ImpactSpeakerRow) => normal(s.email) || s.guid;
  const speakers = choose(
    'speakers',
    IMPACT_DEFINITIONS.speakers,
    [
      { key: 'on-a-session', definition: 'Speaker records on at least one of the season’s sessions', value: rows.speakers.length, rows: rows.speakers },
      { key: 'on-an-active-session', definition: 'Speaker records on at least one active session', value: onActive.length, rows: onActive },
      { key: 'by-email', definition: 'People on at least one session, a speaker copied twice counted once (by email)', value: distinct(rows.speakers, byEmail), rows: rows.speakers },
      { key: 'active-by-email', definition: 'People on at least one active session, each once (by email)', value: distinct(onActive, byEmail), rows: onActive },
      {
        key: 'not-organizers',
        definition: 'People on at least one session who are not organizers, each once (by email)',
        value: distinct(rows.speakers.filter((s) => !s.isOrganizer), byEmail),
        rows: rows.speakers.filter((s) => !s.isOrganizer)
      }
    ],
    REPORTED_2025.speakers
  );
  const counted = speakers.rows as Array<ImpactSpeakerRow>;
  // Each person once, so a speaker copied twice does not count their organization twice.
  const people = [...new Map(counted.map((s) => [byEmail(s), s])).values()];
  const groupOf = (s: ImpactSpeakerRow) => s.organization?.trim() || s.university?.trim() || '';
  const organizations = choose(
    'organizations',
    IMPACT_DEFINITIONS.organizations,
    [
      { key: 'organizations', definition: 'Distinct organizations of the counted speakers', value: distinct(people.filter((s) => normal(s.organization)), (s) => normal(s.organization)) },
      {
        key: 'organizations-and-universities',
        definition: 'Distinct organizations of the counted speakers, a speaker with none counted by their university',
        value: distinct(people.filter((s) => normal(groupOf(s))), (s) => normal(groupOf(s)))
      },
      {
        key: 'both',
        definition: 'Distinct organizations and universities of the counted speakers together',
        value: new Set(people.flatMap((s) => [normal(s.organization), normal(s.university)]).filter(Boolean)).size
      }
    ],
    REPORTED_2025.organizations
  );

  // 3. Check-ins
  const pair = (c: ImpactCheckInRow) => `${c.account}|${c.session}`;
  const activeCheckIns = rows.checkIns.filter((c) => c.sessionActive);
  const checkInOptions = [
    { key: 'all', definition: 'Every check-in to the season’s sessions', rows: rows.checkIns },
    { key: 'active-sessions', definition: 'Check-ins to active sessions', rows: activeCheckIns },
    { key: 'not-outside-time', definition: 'Check-ins made during their session', rows: rows.checkIns.filter((c) => !c.outsideSessionTime) },
    { key: 'not-organizers', definition: 'Check-ins by people who are not organizers', rows: rows.checkIns.filter((c) => !c.organizer) },
    {
      key: 'during-not-organizers',
      definition: 'Check-ins made during their session, by people who are not organizers',
      rows: rows.checkIns.filter((c) => !c.outsideSessionTime && !c.organizer)
    }
  ].flatMap((o) => [
    { key: o.key, definition: o.definition, value: o.rows.length, rows: o.rows },
    {
      key: `${o.key}-each-once`,
      definition: `${o.definition}, a person checked in twice to one session counted once`,
      value: distinct(o.rows, pair),
      rows: [...new Map(o.rows.map((c) => [pair(c), c])).values()]
    }
  ]);
  const checkIns = choose('checkIns', IMPACT_DEFINITIONS.checkIns, checkInOptions, REPORTED_2025.checkIns);

  // 4. Research presentations and posters
  const ofType = (...types: Array<string>) => rows.submissions.filter((s) => types.includes(normal(s.type)));
  const research = (measure: 'researchPresentations' | 'researchPosters', types: Array<Array<string>>, labels: Array<string>) =>
    choose(
      measure,
      IMPACT_DEFINITIONS[measure],
      types.flatMap((t, i) => [
        { key: labels[i], definition: `Submissions of type ${t.join(' or ')}`, value: byLevel(ofType(...t)) },
        { key: `${labels[i]}-accepted`, definition: `Accepted submissions of type ${t.join(' or ')}`, value: byLevel(ofType(...t).filter((s) => s.accepted)) },
        { key: `${labels[i]}-reviewed`, definition: `Reviewed submissions of type ${t.join(' or ')}`, value: byLevel(ofType(...t).filter((s) => s.reviewed)) }
      ]),
      REPORTED_2025[measure]
    );
  const presentations = research('researchPresentations', [['presentation'], ['presentation', 'paper']], ['all', 'presentations-and-papers']);
  const posters = research('researchPosters', [['poster'], ['poster', 'cartography']], ['posters', 'posters-and-cartography']);

  // 5. Trail challenge
  const trailOptions = [
    { key: 'all', definition: 'Every trail submission', rows: rows.trail },
    { key: 'not-discarded', definition: 'Trail submissions not discarded in review', rows: rows.trail.filter((t) => normal(t.status) !== 'discarded') },
    { key: 'verified', definition: 'Verified trail submissions', rows: rows.trail.filter((t) => normal(t.status) === 'verified') }
  ];
  const trail = choose(
    'trail',
    IMPACT_DEFINITIONS.trail,
    trailOptions.map((o) => ({
      key: o.key,
      definition: o.definition,
      value: { submissions: o.rows.length, competitors: distinct(o.rows, (t) => t.person) },
      rows: o.rows
    })),
    REPORTED_2025.trail
  );
  const trailRows = trail.rows as Array<ImpactTrailRow>;

  // 6. Sessions, by day
  const dates = [...rows.days].sort();
  const sessionsCounted = rows.sessions.filter((s) => s.active);
  alternatives['sessions'] = [
    { key: 'all', definition: 'Every session of the season', value: rows.sessions.length },
    { key: 'active', definition: 'Active sessions (shown on the site)', value: sessionsCounted.length }
  ];

  const report: ImpactReport = {
    year: rows.year,
    definitions: {
      participants: participants.definition,
      speakers: speakers.definition,
      organizations: organizations.definition,
      topOrganizations: `The ${IMPACT_TOP} organizations with the most counted speakers`,
      checkIns: checkIns.definition,
      topSessions: `The ${IMPACT_TOP} sessions with the most counted check-ins`,
      researchPresentations: presentations.definition,
      researchPosters: posters.definition,
      trail: `${trail.definition}; competitors are the distinct people who made them, students those who signed up as students`,
      sessions: 'Active sessions (shown on the site), by the GIS Day day they are on'
    },
    participants: participants.value as ImpactReport['participants'],
    speakers: { speakers: speakers.value as number, organizations: organizations.value as number, topOrganizations: impactTop(people.map((s) => s.organization ?? '')) },
    checkIns: { total: checkIns.value as number, topSessions: impactTop((checkIns.rows as Array<ImpactCheckInRow>).map((c) => c.sessionTitle)) },
    researchPresentations: presentations.value as ImpactReport['researchPresentations'],
    researchPosters: posters.value as ImpactReport['researchPosters'],
    trail: {
      submissions: trailRows.length,
      students: distinct(trailRows.filter((t) => t.personType === 'student'), (t) => t.person),
      competitors: distinct(trailRows, (t) => t.person)
    },
    sessions: {
      total: sessionsCounted.length,
      byDay: dates.map((date, i) => ({ day: i + 1, date, sessions: sessionsCounted.filter((s) => s.day === date).length }))
    },
    alternatives
  };

  if (is2025) {
    report.reported2025 = REPORTED_2025;
    report.unmatched2025 = Object.entries(alternatives)
      .filter(([, options]) => options.some((o) => o.matches2025 !== undefined) && !options.some((o) => o.matches2025))
      .map(([measure]) => measure);
  }

  return report;
}

/** The measures compared between seasons, each a label and how to read it from a report. */
function impactMeasures(report: ImpactReport): Array<[string, number]> {
  const p = report.participants;
  const measures: Array<[string, number]> = [
    ['Participants: total', p.total],
    ['Participants: students', p.students],
    ['Participants: industry representatives', p.industry],
    ['Participants: academia guests', p.academia],
    ['Participants: incomplete profiles', p.incomplete],
    ['Speakers', report.speakers.speakers],
    ['Organizations represented by speakers', report.speakers.organizations],
    ['Check-ins', report.checkIns.total],
    ['Research presentations: total', report.researchPresentations.total],
    ['Research presentations: undergraduate', report.researchPresentations.undergraduate],
    ['Research presentations: graduate', report.researchPresentations.graduate],
    ['Research posters: total', report.researchPosters.total],
    ['Research posters: undergraduate', report.researchPosters.undergraduate],
    ['Research posters: graduate', report.researchPosters.graduate],
    ['Trail challenge: submissions', report.trail.submissions],
    ['Trail challenge: students who submitted', report.trail.students],
    ['Trail challenge: everyone who submitted', report.trail.competitors],
    ['Sessions: total', report.sessions.total]
  ];

  report.sessions.byDay.forEach((d) => measures.push([`Sessions: day ${d.day}`, d.sessions]));

  return measures;
}

const csvCell = (value: string | number | null | undefined) => {
  const text = value === null || value === undefined ? '' : `${value}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const csv = (rows: Array<Array<string | number | null | undefined>>) => rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';

/**
 * Two seasons compared (#3238): `measures`, one row per measure with the earlier and later season's numbers, the
 * change and the percent change (blank where the earlier is 0, or a season has no such day); and `lists`, the top
 * organizations and sessions, each name in either season's list once, ranked by the later season's count.
 */
export function impactCsv(earlier: ImpactReport, later: ImpactReport): { measures: string; lists: string } {
  const [a, b] = earlier.year <= later.year ? [earlier, later] : [later, earlier];
  const before = new Map(impactMeasures(a));
  const after = new Map(impactMeasures(b));
  const labels = [...new Set([...before.keys(), ...after.keys()])];

  const measures = csv([
    ['measure', `${a.year}`, `${b.year}`, 'change', 'percent change'],
    ...labels.map((label) => {
      const x = before.get(label);
      const y = after.get(label);
      const change = x !== undefined && y !== undefined ? y - x : undefined;
      const percent = change !== undefined && x ? Math.round((change / x) * 1000) / 10 : undefined;

      return [label, x, y, change, percent];
    })
  ]);

  const list = (name: string, of: (r: ImpactReport) => Array<ImpactNamedCount>) => {
    const counts = new Map<string, { name: string; a?: number; b?: number }>();

    of(a).forEach((e) => counts.set(normal(e.name), { name: e.name, a: e.count }));
    of(b).forEach((e) => counts.set(normal(e.name), { ...(counts.get(normal(e.name)) ?? { name: e.name }), name: e.name, b: e.count }));

    return [...counts.values()]
      .sort((x, y) => (y.b ?? -1) - (x.b ?? -1) || (y.a ?? -1) - (x.a ?? -1) || x.name.localeCompare(y.name))
      .map((e, i) => [name, i + 1, e.name, e.a, e.b]);
  };

  const lists = csv([
    ['list', 'rank', 'name', `${a.year} count`, `${b.year} count`],
    ...list('Top organizations by speakers', (r) => r.speakers.topOrganizations),
    ...list('Top sessions by check-ins', (r) => r.checkIns.topSessions)
  ]);

  return { measures, lists };
}
