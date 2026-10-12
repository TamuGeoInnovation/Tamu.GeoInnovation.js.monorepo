/**
 * A saved copy of the real Code Maroon feed, exactly as https://codemaroon.tamu.edu/feed.xml served it
 * on 2 October 2026: the channel header with no items, which is its normal state between alerts.
 *
 * Read only when this server has no proxy for the feed (#1304). Dev and production serve AggieMap from
 * IIS, which has no rule for `/code-maroon/feed.xml` yet, so the request comes back as the
 * application's own page. Remove this once the IIS proxy is in place.
 */
export const CODE_MAROON_SNAPSHOT = `<rss version='2.0' xmlns:atom='http://www.w3.org/2005/Atom'>
  <channel>
    <title>Code Maroon Active Alerts</title>
    <description>This feed displays active Code Maroon alerts.</description>
    <link>http://codemaroon.tamu.edu</link>
    <copyright>2026 Texas A &amp; M</copyright>
    <docs>http://blogs.law.harvard.edu/tech/rss</docs>
    <language>en-us</language>
  </channel>
</rss>
`;
