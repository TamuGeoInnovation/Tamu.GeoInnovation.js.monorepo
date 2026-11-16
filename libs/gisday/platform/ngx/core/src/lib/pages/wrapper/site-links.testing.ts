import { readFileSync } from 'fs';

import { Routes } from '@angular/router';

import { accountRoutes } from '../account/account.routes';
import { wrapperRoutes } from './wrapper.routes';

/**
 * For specs that a page's links within the site lead to pages it has (#3148, #2024): the FAQ page's sign-up and classes
 * links, and the footer's My Account links, each pointed at an address with no route, and the catch-all answered with
 * "We couldn't find that page".
 */

/** The fixed links within the site a template gives: `[routerLink]="['/a']"`, `['/a/b']` and `routerLink="/a"`. */
export function siteLinksIn(templateFile: string): Array<string> {
  const html = readFileSync(templateFile, 'utf-8');

  return [
    ...new Set([
      ...[...html.matchAll(/\[routerLink\]="\['(\/[^']*)'\]"/g)].map((m) => m[1]),
      ...[...html.matchAll(/\srouterLink="(\/[^"]*)"/g)].map((m) => m[1])
    ])
  ];
}

/** The route an address within the site reaches, or undefined: the catch-all, "not found", does not count. */
export function routeOf(link: string) {
  const top: Routes = wrapperRoutes[0].children ?? [];
  const account: Routes = accountRoutes[0].children ?? accountRoutes;
  const [first, second] = link.replace(/^\//, '').split('/');
  const route = top.find((r) => r.path === first && r.path !== '**');

  if (!route || second === undefined) {
    return route;
  }

  return first === 'account' ? account.find((r) => r.path === second) : undefined;
}
