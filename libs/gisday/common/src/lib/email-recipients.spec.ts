import {
  EMAIL_RECIPIENTS_KEY,
  EMAIL_TOGETHER_KEY,
  alphabetical,
  joinNames,
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
