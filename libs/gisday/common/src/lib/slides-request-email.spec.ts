import {
  PROFILE_EDIT_LINK_PREVIEW,
  SESSION_FILES_LIMIT,
  SESSION_FILES_RULE,
  SLIDES_REQUEST_COPY_EACH,
  SLIDES_REQUEST_EMAIL_KIND,
  SLIDES_REQUEST_EMAIL_PLACEHOLDERS,
  SUBMISSION_FILE_RULES,
  fillProfileEmail,
  megabytes,
  profileEmailValues,
  slidesRequestEmailProblem,
  slidesRequestEmailSubject,
  slidesRequestEmailTemplate
} from '../index';

/**
 * #3113: the email that asks a session's speakers for their slides. Prefilled from the session (its name, day, time in
 * Central and room), with what they may upload in the upload rule's own words, and each speaker's own edit link, which is
 * why it only ever goes as a copy each.
 */
describe('The Ask for slides email (#3113)', () => {
  // A made-up session.
  const session = {
    guid: 'e-1',
    name: 'Made-up hybrid session',
    mode: 'hybrid',
    day: { date: '2026-11-19T06:00:00.000Z' },
    startTime: '13:00:00 GMT-0600 (Central Standard Time)',
    endTime: '14:15:00 GMT-0600 (Central Standard Time)',
    location: { building: 'MSC', room: '2300' }
  };

  it("is a kind of its own, with the profile email's placeholders, its edit link among them", () => {
    expect(SLIDES_REQUEST_EMAIL_KIND).toBe('slides-request');
    expect(SLIDES_REQUEST_EMAIL_PLACEHOLDERS).toEqual(
      expect.arrayContaining(['{first name}', '{site}', '{edit link}', '{link expires}'])
    );
  });

  it("names the session in its subject, with the site's placeholder", () => {
    expect(slidesRequestEmailSubject(session)).toBe('Your slides for {site}: Made-up hybrid session');
  });

  it("asks for the slides with the session's name, its day and time in Central, and its room", () => {
    const text = slidesRequestEmailTemplate(session);

    expect(text).toContain('**Made-up hybrid session**');
    expect(text).toContain('Thursday, November 19, 2026, 1:00 to 2:15 PM Central');
    expect(text).toContain('MSC 2300, and online');
    expect(text).toContain('{edit link}');
    expect(text).toContain('{link expires}');
  });

  // #3126: in Texas A&M's design the details box says when and where, so the text does not say them again.
  it('leaves when and where to the details box when the email is in the design, and keeps the upload link', () => {
    const text = slidesRequestEmailTemplate(session, true);

    expect(text).not.toContain('**When:**');
    expect(text).not.toContain('**Where:**');
    expect(text).toContain('**Made-up hybrid session**');
    expect(text).toContain('{edit link}');
  });

  it('says what may be uploaded in the upload rule’s own words, not typed', () => {
    expect(SESSION_FILES_RULE).toContain(megabytes(SUBMISSION_FILE_RULES.maxBytes));
    expect(SESSION_FILES_RULE).toContain(SESSION_FILES_LIMIT);
    SUBMISSION_FILE_RULES.extensions.forEach((extension) => expect(SESSION_FILES_RULE).toContain(extension));
    expect(slidesRequestEmailTemplate(session)).toContain(SESSION_FILES_RULE);
  });

  it('says when a session has no day, time or room yet', () => {
    const text = slidesRequestEmailTemplate({ guid: 'e-2', name: 'Unscheduled', mode: 'in-person' });

    expect(text).toContain('**When:** To be announced');
    expect(text).toContain('**Where:** To be announced');
  });

  it('fills in as each speaker gets it, with their own link', () => {
    const { subject, text } = fillProfileEmail(
      { subject: slidesRequestEmailSubject(session), template: slidesRequestEmailTemplate(session) },
      profileEmailValues(
        { firstName: 'Avery' },
        { name: 'Texas A&M GIS Day', address: 'https://gisday.tamu.edu' },
        'https://gisday.tamu.edu/presenters/edit/LINK-OF-AVERY',
        new Date('2026-11-22T18:00:00Z')
      )
    );

    expect(subject).toBe('Your slides for Texas A&M GIS Day: Made-up hybrid session');
    expect(text).toContain('Howdy Avery,');
    expect(text).toContain('https://gisday.tamu.edu/presenters/edit/LINK-OF-AVERY');
    expect(text).toContain('Sunday, November 22');
    expect(text).not.toMatch(/\{[a-z ]+\}/);
  });

  it('says why it goes as a copy each: their own link', () => {
    expect(SLIDES_REQUEST_COPY_EACH).toMatch(/own copy/);
    expect(SLIDES_REQUEST_COPY_EACH).toMatch(/own link/);
  });

  it('refuses an edited email that drops the edit link, or has no subject', () => {
    expect(slidesRequestEmailProblem({ subject: 'S', template: 'Upload here: {edit link}' })).toBeNull();
    expect(slidesRequestEmailProblem({ subject: 'S', template: 'No link' })).toMatch(/\{edit link\}/);
    expect(slidesRequestEmailProblem({ subject: ' ', template: '{edit link}' })).toMatch(/subject/);
  });

  it('is previewed with the stand-in, never a real link', () => {
    expect(PROFILE_EDIT_LINK_PREVIEW).not.toMatch(/presenters\/edit/);
  });
});
