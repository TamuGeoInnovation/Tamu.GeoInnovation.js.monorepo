// The admin pages' services and the settings they read import one another; the event page loads them in the order the
// application does.
import { sessionCheckInRows } from './events/pages/event-detail/event-detail.component';
import { SiteCopyComponent } from './admin/pages/site-copy/site-copy.component';

/**
 * The times two GIS Day pages print in Central time (#3323), either side of the November and March changes of 2026,
 * pinned before they format through gisday/common's one Central-time module: a session's check-ins, and the site copy's
 * times. The narrow no-break space before AM and PM is compared as a plain space.
 */
describe("the pages' Central times (#3323)", () => {
  const INSTANTS = [
    '2026-10-31T23:30:00.000Z',
    '2026-11-01T15:00:00.000Z',
    '2026-03-08T04:30:00.000Z',
    '2026-03-08T15:00:00.000Z'
  ];
  const plain = (text: string) => text.replace(/\u202f/g, ' ');

  it("a session's check-ins", () => {
    expect(
      sessionCheckInRows(
        INSTANTS.map((created, i) => ({ guid: `c-${i}`, accountGuid: 'a', created: new Date(created) })) as never,
        []
      ).map((r) => plain(r.at))
    ).toEqual(['Oct 31, 6:30 PM CDT', 'Nov 1, 9:00 AM CST', 'Mar 7, 10:30 PM CST', 'Mar 8, 10:00 AM CDT']);
  });

  it("the site copy's times", () => {
    expect(INSTANTS.map((i) => plain(SiteCopyComponent.prototype.central.call(null, i)))).toEqual([
      'Oct 31, 2026, 6:30 PM Central',
      'Nov 1, 2026, 9:00 AM Central',
      'Mar 7, 2026, 10:30 PM Central',
      'Mar 8, 2026, 10:00 AM Central'
    ]);
  });
});
