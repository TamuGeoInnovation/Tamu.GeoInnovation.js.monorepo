import { join } from 'path';

import { routeOf, siteLinksIn } from './site-links.testing';

/**
 * #2024. The footer's My Account links went to `/me` and `/me/classes`, which the site has no route for, so every page's
 * Profile Details and My Classes led to "We couldn't find that page". The pages are `/account/details` and
 * `/account/classes`. Every link the footer gives within the site must lead to a page it has.
 */
describe('the footer, its links', () => {
  const footer = join(__dirname, '..', '..', '..', '..', '..', 'common', 'src', 'lib', 'modules', 'footer', 'footer.component.html');
  const links = siteLinksIn(footer);

  it('gives the My Account links to read', () => {
    // "Registered Sessions" went to the public Sessions list; it is the visitor's own check-ins now (the maintainer).
    expect(links).toEqual(expect.arrayContaining(['/account/details', '/account/classes', '/account/checkins']));
    expect(links).not.toContain('/sessions');
  });

  it.each(links)('leads %s to a page the site has', (link) => {
    expect(routeOf(link)).toBeDefined();
  });
});
