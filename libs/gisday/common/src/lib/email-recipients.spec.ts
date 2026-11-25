import {
  EMAIL_RECIPIENTS_KEY,
  EMAIL_TOGETHER_KEY,
  alphabetical,
  joinNames,
  notSentFirst,
  sendsDetail,
  sendsLine,
  wasSent,
  togetherFirstNames,
  togetherTo,
  withoutRecipients
} from './email-recipients';
import { EMAIL_SENDER_KEY } from './email-sender';

/** #3104: which speakers get an email, and one email to all of them together or a copy each. */
describe('email recipients', () => {
  it('joins names as a sentence lists them', () => {
    expect(joinNames([])).toBe('');
    expect(joinNames(['Ana'])).toBe('Ana');
    expect(joinNames(['Sharmin', 'Colby'])).toBe('Sharmin and Colby');
    expect(joinNames(['Ana', 'Ben', 'Cara'])).toBe('Ana, Ben and Cara');
    expect(joinNames(['Ana', ' ', 'Ben', 'Cara', 'Dee'])).toBe('Ana, Ben, Cara and Dee');
  });

  it('greets everyone in a together email by first name, and anyone with none as "there"', () => {
    expect(togetherFirstNames([{ firstName: 'Sharmin' }, { firstName: 'Colby' }])).toBe('Sharmin and Colby');
    expect(togetherFirstNames([{ firstName: 'Ana' }, { firstName: 'Ben' }, { firstName: 'Cara' }])).toBe(
      'Ana, Ben and Cara'
    );
    expect(togetherFirstNames([{ firstName: '' }, { firstName: null }])).toBe('there');
  });

  it('puts every address of a together email on one To line', () => {
    expect(togetherTo([{ email: ' ana@example.com ' }, { email: 'ben@example.com' }])).toBe(
      'ana@example.com, ben@example.com'
    );
  });

  it("reads the composer's choice of speakers, and together, apart from the texts and the sender", () => {
    expect(
      withoutRecipients({
        'session-details': 'Howdy {first name},',
        [EMAIL_SENDER_KEY]: 'me@example.com',
        [EMAIL_RECIPIENTS_KEY]: 's-1,s-2',
        [EMAIL_TOGETHER_KEY]: 'true'
      })
    ).toEqual({
      speakers: ['s-1', 's-2'],
      together: true,
      rest: { 'session-details': 'Howdy {first name},', [EMAIL_SENDER_KEY]: 'me@example.com' }
    });
    expect(withoutRecipients({ [EMAIL_RECIPIENTS_KEY]: 's-1' })).toEqual({ speakers: ['s-1'], rest: {} });
    // A composer that listed no speakers (the review emails) leaves both out, so nothing is narrowed.
    expect(withoutRecipients({ poster: 'T' })).toEqual({ rest: { poster: 'T' } });
  });

  // #3142: the composer lists them by last name (the maintainer's call, 16 November 2026), whatever order the API gave.
  it('puts them in order by last name, then first, ignoring case and accents, without changing the list given', () => {
    const given = [
      { guid: 'zh', name: 'Ana Zhou', firstName: 'Ana' },
      { guid: 'ad', name: 'Zed Adams', firstName: 'Zed' },
      // A first name of two words still sorts by the surname after it.
      { guid: 'br', name: 'Mary Ann Brown', firstName: 'Mary Ann' },
      { guid: 'ec', name: 'Bo écrit', firstName: 'Bo' },
      { guid: 'ab', name: 'Ann Adams', firstName: 'Ann' },
      // No first name on the record: the last word is taken as the surname.
      { guid: 'cl', name: 'Pat Clark', firstName: '' }
    ];

    expect(alphabetical(given).map((r) => r.guid)).toEqual(['ab', 'ad', 'br', 'cl', 'ec', 'zh']);
    expect(given.map((r) => r.guid)).toEqual(['zh', 'ad', 'br', 'ec', 'ab', 'cl']);
    expect(alphabetical(undefined)).toEqual([]);
  });
});

/** #3167: what each speaker was sent before, as the composer says it. Times are shown in US Central. */
describe('the record of sends', () => {
  const never = { name: 'Avery Example', sends: { thisEmail: [], others: [] } };
  const twice = {
    name: 'Blair Sample',
    sends: {
      // 4:05 PM and 9:30 AM Central, 16 November 2026.
      thisEmail: ['2026-11-16T22:05:00.000Z', '2026-11-16T15:30:00.000Z'],
      others: [{ kind: 'profile', at: '2026-11-15T20:10:00.000Z' }]
    }
  };
  const unknown = { name: 'Cara Test' };

  it('says whether and when each was sent this email, and nothing when the API kept no record', () => {
    expect(sendsLine(never)).toBe('Not sent yet');
    expect(sendsLine(twice)).toBe('Sent 2 times, last Nov 16, 4:05 PM');
    expect(sendsLine({ sends: { thisEmail: ['2026-11-16T15:30:00.000Z'], others: [] } })).toBe(
      'Sent once, last Nov 16, 9:30 AM'
    );
    expect(sendsLine(unknown)).toBe('');
  });

  it('lists every email each was sent with its date, newest first, naming the others', () => {
    expect(sendsDetail(twice)).toEqual([
      'Nov 16, 4:05 PM: this email',
      'Nov 16, 9:30 AM: this email',
      'Nov 15, 2:10 PM: the presenter profile email'
    ]);
    expect(sendsDetail(never)).toEqual([]);
  });

  it('puts those not yet sent it first, each part in the order given', () => {
    const also = { name: 'Dana Other', sends: { thisEmail: [], others: [] } };

    expect(notSentFirst([twice, never, also]).map((r) => r.name)).toEqual(['Avery Example', 'Dana Other', 'Blair Sample']);
    expect([never, twice, unknown].map(wasSent)).toEqual([false, true, false]);
  });
});
