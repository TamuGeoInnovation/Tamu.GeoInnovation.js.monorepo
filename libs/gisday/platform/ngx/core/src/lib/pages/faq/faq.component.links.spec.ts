import { readFileSync } from 'fs';
import { join } from 'path';

import { Routes } from '@angular/router';

import { accountRoutes } from '../account/account.routes';
import { wrapperRoutes } from '../wrapper/wrapper.routes';

/**
 * #3148. Four of the FAQ page's links led to "We couldn't find that page": `/signup`, which the site had no route for,
 * and `/account/my-classes`, where the page is `/account/classes`; and `/login` drew an empty page. Every link the FAQ
 * page gives within the site must lead to a page it has, and the sign-in ones must start signing in.
 */
describe('the FAQ page, its links', () => {
  const html = readFileSync(join(__dirname, 'faq.component.html'), 'utf-8');
  // `[routerLink]="['/a']"`, `[routerLink]="['/a/b']"` and `routerLink="/a"`, as the page writes them.
  const links = [
    ...[...html.matchAll(/\[routerLink\]="\['([^']+)'\]"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\srouterLink="([^"]+)"/g)].map((m) => m[1])
  ];
  const top: Routes = wrapperRoutes[0].children ?? [];
  const account: Routes = accountRoutes[0].children ?? accountRoutes;

  /** The route an address within the site reaches, or undefined: the catch-all, "not found", does not count. */
  function routeOf(link: string) {
    const [first, second] = link.replace(/^\//, '').split('/');
    const route = top.find((r) => r.path === first && r.path !== '**');

    if (!route || second === undefined) {
      return route;
    }

    return first === 'account' ? account.find((r) => r.path === second) : undefined;
  }

  it('gives links within the site to read', () => {
    expect(links.length).toBeGreaterThan(5);
  });

  it.each([...new Set(links)])('leads %s to a page the site has', (link) => {
    expect(routeOf(link)).toBeDefined();
  });

  it.each(['/signup', '/login'])('starts signing in at %s, rather than drawing an empty page', (link) => {
    expect(routeOf(link)?.canActivate?.length).toBeGreaterThan(0);
  });
});
