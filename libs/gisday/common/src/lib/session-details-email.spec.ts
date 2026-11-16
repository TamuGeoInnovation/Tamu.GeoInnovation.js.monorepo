import {
  SESSION_DETAILS_EMAIL_PLACEHOLDERS,
  sessionDetailsEmailProblem,
  sessionDetailsEmailSubject,
  sessionDetailsEmailTemplate,
  sessionDetailsEmailValues
} from './session-details-email';
import { fillReviewEmail } from './review-email';

/**
 * #3092: a session's speakers get its details in one email, prefilled from the session and edited in the same window as
 * the profile email before it is sent.
 */
describe('the session details email', () => {
  const address = 'https://gisday.tamu.edu';
  const hybrid = {
    guid: 'e-1',
    name: 'WORKSHOP: Mapping floods',
    mode: 'hybrid',
    // Thursday 19 November 2026; a day arrives as midnight Central.
    day: { date: '2026-11-19T06:00:00.000Z' },
    startTime: '13:00:00 GMT-0600 (Central Standard Time)',
    endTime: '14:15:00 GMT-0600 (Central Standard Time)',
    location: { building: 'MSC', room: '2300 A&B' },
    broadcast: {
      publicUrl: 'https://zoom.example/j/123',
      password: 'pw-placeholder',
      phoneNumber: '+1 555 0100',
      meetingId: '123 456 789'
    },
    requirements: 'A laptop with ArcGIS Pro installed.'
  };

  it('names the session, its day and time in Central, and its room', () => {
    const text = sessionDetailsEmailTemplate(hybrid, address);

    expect(text).toContain('WORKSHOP: Mapping floods');
    expect(text).toContain('Thursday, November 19, 2026, 1:00 to 2:15 PM Central');
    expect(text).toContain('MSC 2300 A&B');
    expect(text).toContain(`${address}/sessions/details/e-1`);
  });

  // #3114: on Texas A&M's site the design's details box already says when and where, so the text does not say it again.
  it('leaves when and where to the details box when the email is in the design, and keeps the session page', () => {
    const text = sessionDetailsEmailTemplate(hybrid, address, true);

    expect(text).not.toContain('**When:**');
    expect(text).not.toContain('**Where:**');
    expect(text).not.toContain('1:00 to 2:15 PM Central');
    expect(text).toContain(`${address}/sessions/details/e-1`);
    expect(text).toContain('**Joining online:**');
  });

  it('gives a hybrid or virtual session its Zoom link and dial-in, as the session page shows them', () => {
    for (const mode of ['hybrid', 'virtual']) {
      const text = sessionDetailsEmailTemplate({ ...hybrid, mode }, address);

      expect(text).toContain('https://zoom.example/j/123');
      expect(text).toContain('Dial-in number:** +1 555 0100');
      expect(text).toContain('Meeting ID:** 123 456 789');
      expect(text).toContain('Password:** pw-placeholder');
    }
  });

  it('says a virtual session is online, with no room', () => {
    const text = sessionDetailsEmailTemplate({ ...hybrid, mode: 'virtual' }, address);

    expect(text).toContain('**Where:** Online');
    expect(text).not.toContain('2300 A&B');
  });

  it('gives an in-person session no online details', () => {
    const inPerson = sessionDetailsEmailTemplate({ ...hybrid, mode: 'in-person' }, address);

    expect(inPerson).not.toContain('zoom.example');
    expect(inPerson).not.toContain('Dial-in');
  });

  // #3104: "Dial-in number: None" was written into the email; a broadcast line with no value is left out instead.
  it('leaves out every broadcast line with no value, the dial-in number included, and keeps the link', () => {
    for (const empty of [null, undefined, '', '   ']) {
      const text = sessionDetailsEmailTemplate(
        {
          ...hybrid,
          broadcast: { publicUrl: 'https://zoom.example/j/1', password: empty, phoneNumber: empty, meetingId: empty }
        },
        address
      );

      expect(text).toContain('**Joining online:**\n\n- **Link:** https://zoom.example/j/1\n\n**Check-in:**');
      expect(text).not.toContain('None');
      expect(text).not.toContain('Dial-in');
      expect(text).not.toContain('Password');
      expect(text).not.toContain('Meeting ID');
    }
  });

  it('says when a hybrid session has no broadcast yet, rather than leaving the link out silently', () => {
    expect(sessionDetailsEmailTemplate({ ...hybrid, broadcast: null }, address)).toContain('The online link is not set yet');
  });

  it('says the check-in QR code is shown at the session and scanned there', () => {
    const text = sessionDetailsEmailTemplate(hybrid, address);

    expect(text).toMatch(/check-in QR code/);
    expect(text).toMatch(/shown at the session and scanned there/);
  });

  it("lists what to bring from the session's requirements, or says there are none", () => {
    expect(sessionDetailsEmailTemplate(hybrid, address)).toContain(
      '**What to bring:**\n\nA laptop with ArcGIS Pro installed.'
    );
    expect(sessionDetailsEmailTemplate({ ...hybrid, requirements: '  ' }, address)).toContain(
      '**What to bring:** the session lists no requirements.'
    );
  });

  it('says when the time or the room is not set, rather than printing nothing', () => {
    const text = sessionDetailsEmailTemplate(
      { ...hybrid, mode: 'in-person', day: null, startTime: null, location: null },
      address
    );

    expect(text).toContain('**When:** To be announced');
    expect(text).toContain('**Where:** To be announced');
  });

  it("fills in each speaker's first name and the site, and leaves no placeholder behind", () => {
    const values = sessionDetailsEmailValues({ firstName: ' Ana ' }, { name: 'Texas A&M GIS Day', address });
    const text = fillReviewEmail(sessionDetailsEmailTemplate(hybrid, address), values);

    expect(text.startsWith('Howdy Ana,')).toBe(true);
    expect(text).toContain('Texas A&M GIS Day');
    expect(text).not.toMatch(/\{[a-z ]+\}/);
    expect(fillReviewEmail(sessionDetailsEmailSubject(hybrid), values)).toBe(
      'Your Texas A&M GIS Day session: WORKSHOP: Mapping floods'
    );
    expect(Object.keys(values).sort()).toEqual([...SESSION_DETAILS_EMAIL_PLACEHOLDERS].sort());
  });

  it('refuses an email with no subject or no text, and takes one that has both', () => {
    expect(sessionDetailsEmailProblem({ subject: ' ', template: 'Hi' })).toMatch(/subject/);
    expect(sessionDetailsEmailProblem({ subject: 'Hi', template: '' })).toMatch(/email/);
    expect(sessionDetailsEmailProblem({ subject: 'Hi', template: 'Hello' })).toBeNull();
  });
});
