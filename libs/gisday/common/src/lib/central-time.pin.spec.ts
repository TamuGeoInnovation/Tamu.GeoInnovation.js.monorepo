import { checkInOpensAt, dayHasPassed, sessionTime } from './gisday-common';
import { sentAt } from './email-recipients';
import { profileEmailValues } from './profile-email';
import { sessionDay } from './review-email';
import { inCentralTime } from './submission-deadlines';

/**
 * What each Central-time caller in gisday/common prints (#3323), either side of the November and March changes of 2026
 * (1 November and 8 March). Pinned before they share one module, so the move is seen to change nothing but the narrow
 * no-break space some put before AM and PM, which is compared here as a plain space.
 */
const plain = (text: string) => text.replace(/\u202f/g, ' ');

/** Instants either side of each change: the evening before and the morning after, in Central time. */
const INSTANTS = [
  '2026-10-31T23:30:00.000Z', // Sat, Oct 31, 6:30 PM CDT
  '2026-11-01T15:00:00.000Z', // Sun, Nov 1, 9:00 AM CST
  '2026-03-08T04:30:00.000Z', // Sat, Mar 7, 10:30 PM CST
  '2026-03-08T15:00:00.000Z' // Sun, Mar 8, 10:00 AM CDT
];

describe('Central time, as each caller in gisday/common prints it (#3323)', () => {
  it('sentAt', () => {
    expect(INSTANTS.map((i) => plain(sentAt(i)))).toEqual([
      'Oct 31, 6:30 PM',
      'Nov 1, 9:00 AM',
      'Mar 7, 10:30 PM',
      'Mar 8, 10:00 AM'
    ]);
  });

  it("profileEmailValues' link expiry", () => {
    expect(
      INSTANTS.map((i) =>
        plain(
          profileEmailValues({}, { name: 'GIS Day', address: 'https://example.edu' }, 'x', new Date(i))['{link expires}']
        )
      )
    ).toEqual(['Saturday, October 31', 'Sunday, November 1', 'Saturday, March 7', 'Sunday, March 8']);
  });

  it('sessionDay, short and long', () => {
    expect(
      INSTANTS.flatMap((i) => [
        plain(sessionDay({ day: { date: i } } as never, 'short')),
        plain(sessionDay({ day: { date: i } } as never, 'long'))
      ])
    ).toEqual([
      'Sat, Oct 31',
      'Saturday, October 31, 2026',
      'Sun, Nov 1',
      'Sunday, November 1, 2026',
      'Sat, Mar 7',
      'Saturday, March 7, 2026',
      'Sun, Mar 8',
      'Sunday, March 8, 2026'
    ]);
  });

  it('inCentralTime, full and brief', () => {
    expect(INSTANTS.flatMap((i) => [plain(inCentralTime(i)), plain(inCentralTime(i, 'No limit', { brief: true }))])).toEqual(
      [
        'Sat, Oct 31, 2026, 6:30 PM Central',
        'Sat, Oct 31, 6:30 PM',
        'Sun, Nov 1, 2026, 9:00 AM Central',
        'Sun, Nov 1, 9:00 AM',
        'Sat, Mar 7, 2026, 10:30 PM Central',
        'Sat, Mar 7, 10:30 PM',
        'Sun, Mar 8, 2026, 10:00 AM Central',
        'Sun, Mar 8, 10:00 AM'
      ]
    );
  });

  it('checkInOpensAt, the same day and another', () => {
    expect(
      INSTANTS.flatMap((i) => [
        plain(checkInOpensAt(new Date(i), new Date(i))),
        plain(checkInOpensAt(new Date(i), new Date('2026-06-01T15:00:00.000Z')))
      ])
    ).toEqual([
      'at 6:30 PM',
      'on Saturday, October 31 at 6:30 PM',
      'at 9:00 AM',
      'on Sunday, November 1 at 9:00 AM',
      'at 10:30 PM',
      'on Saturday, March 7 at 10:30 PM',
      'at 10:00 AM',
      'on Sunday, March 8 at 10:00 AM'
    ]);
  });

  it('sessionTime, on the Central day, with and without a stored offset', () => {
    expect(
      INSTANTS.flatMap((i) => [
        sessionTime(i, '16:00:00')?.toISOString(),
        sessionTime(i, '16:00:00 GMT-0600 (Central Standard Time)')?.toISOString(),
        sessionTime(i, '00:30')?.toISOString()
      ])
    ).toEqual([
      '2026-10-31T21:00:00.000Z',
      '2026-10-31T22:00:00.000Z',
      '2026-10-31T05:30:00.000Z',
      '2026-11-01T22:00:00.000Z',
      '2026-11-01T22:00:00.000Z',
      '2026-11-01T05:30:00.000Z',
      '2026-03-07T22:00:00.000Z',
      '2026-03-07T22:00:00.000Z',
      '2026-03-07T06:30:00.000Z',
      '2026-03-08T21:00:00.000Z',
      '2026-03-08T22:00:00.000Z',
      '2026-03-08T06:30:00.000Z'
    ]);
  });

  it('dayHasPassed, the next morning and the same evening', () => {
    expect(
      INSTANTS.flatMap((i) => [
        dayHasPassed(i, new Date(new Date(i).getTime() + 12 * 60 * 60 * 1000)),
        dayHasPassed(i, new Date(new Date(i).getTime() + 60 * 60 * 1000))
      ])
    ).toEqual([true, false, false, false, true, false, false, false]);
  });
});
