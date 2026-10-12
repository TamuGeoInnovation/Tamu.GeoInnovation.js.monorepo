import { parseCodeMaroonFeed } from './code-maroon.parser';

/**
 * No real Code Maroon alert item has ever been observed - the feed was empty every time it was read
 * while this was built (#1289). These fix the behaviour we can be sure of: the real empty feed,
 * standard RSS 2.0 fields, and that an unanticipated field survives rather than being dropped.
 */

/** The real feed, byte for byte, as served on 1 October 2026 while no alert was active. */
const EMPTY_FEED = `<rss version='2.0' xmlns:atom='http://www.w3.org/2005/Atom'>
  <channel>
    <title>Code Maroon Active Alerts</title>
    <description>This feed displays active Code Maroon alerts.</description>
    <link>http://codemaroon.tamu.edu</link>
    <copyright>2026 Texas A &amp; M</copyright>
    <docs>http://blogs.law.harvard.edu/tech/rss</docs>
    <language>en-us</language>
  </channel>
</rss>`;

function feedWith(items: string): string {
  return `<rss version='2.0'><channel><title>Code Maroon Active Alerts</title>${items}</channel></rss>`;
}

describe('parsing the Code Maroon feed', () => {
  it('reads the real empty feed as no alerts, not as a failure', () => {
    // This is the feed's normal state. Treating it as an error would put the map into its
    // "cannot tell" state almost all of the time.
    expect(parseCodeMaroonFeed(EMPTY_FEED)).toEqual([]);
  });

  it('reads the standard fields of an alert', () => {
    const alerts = parseCodeMaroonFeed(
      feedWith(`<item>
        <title>Tornado Warning</title>
        <description>Take shelter now.</description>
        <link>https://clq.io/abc123</link>
        <pubDate>Wed, 01 Oct 2026 16:29:14 GMT</pubDate>
        <guid>alert-1</guid>
      </item>`)
    );

    expect(alerts.length).toBe(1);
    expect(alerts[0].title).toBe('Tornado Warning');
    expect(alerts[0].description).toBe('Take shelter now.');
    expect(alerts[0].link).toBe('https://clq.io/abc123');
    expect(alerts[0].guid).toBe('alert-1');
    expect(alerts[0].published?.getUTCFullYear()).toBe(2026);
  });

  it('keeps a field it does not recognise rather than dropping it', () => {
    // The whole reason this is forgiving: we have not seen a real item, so a field we did not
    // anticipate is more likely to matter than not - especially during an emergency.
    const alerts = parseCodeMaroonFeed(
      feedWith('<item><title>Gas leak</title><category>HazMat</category><location>Zachry</location></item>')
    );

    expect(alerts[0].extra['category']).toBe('HazMat');
    expect(alerts[0].extra['location']).toBe('Zachry');
  });

  it('keeps an alert whose date it cannot read', () => {
    const alerts = parseCodeMaroonFeed(feedWith('<item><title>Alert</title><pubDate>not a date</pubDate></item>'));

    expect(alerts.length).toBe(1);
    expect(alerts[0].published).toBeUndefined();
  });

  it('still names an alert that arrives with no title', () => {
    const alerts = parseCodeMaroonFeed(feedWith('<item><description>Something happened</description></item>'));

    expect(alerts[0].title).toBe('Code Maroon alert');
  });

  it('reads every alert when more than one is active', () => {
    const alerts = parseCodeMaroonFeed(
      feedWith('<item><title>First</title></item><item><title>Second</title></item>')
    );

    expect(alerts.map((a) => a.title)).toEqual(['First', 'Second']);
  });

  it('refuses malformed XML rather than reporting no alerts', () => {
    // Silence is the dangerous answer here: "no alerts" and "I could not read the feed" must not
    // look the same to the map.
    expect(() => parseCodeMaroonFeed('<rss><channel><item>')).toThrow();
  });
});
