import { join } from 'path';

import { routeOf, siteLinksIn } from '../wrapper/site-links.testing';

/**
 * #3148. Four of the FAQ page's links led to "We couldn't find that page": `/signup`, which the site had no route for,
 * and `/account/my-classes`, where the page is `/account/classes`; and `/login` drew an empty page. Every link the FAQ
 * page gives within the site must lead to a page it has, and the sign-in ones must start signing in.
 */
describe('the FAQ page, its links', () => {
  const links = siteLinksIn(join(__dirname, 'faq.component.html'));

  it('gives links within the site to read', () => {
    expect(links.length).toBeGreaterThan(5);
  });

  it.each(links)('leads %s to a page the site has', (link) => {
    expect(routeOf(link)).toBeDefined();
  });

  it.each(['/signup', '/login'])('starts signing in at %s, rather than drawing an empty page', (link) => {
    expect(routeOf(link)?.canActivate?.length).toBeGreaterThan(0);
  });
});
