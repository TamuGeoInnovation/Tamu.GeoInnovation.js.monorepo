import { Pipe, PipeTransform } from '@angular/core';

/**
 * Turns a page path into a router link that stays in the year being looked at: `'sessions'` becomes
 * `['/seasons', 2025, 'sessions']` on 2025's pages and `['/sessions']` everywhere else (#1758).
 *
 * @example <a [routerLink]="'presenters' | seasonLink : (viewedYear$ | async)">Presenters</a>
 */
@Pipe({ name: 'seasonLink' })
export class SeasonLinkPipe implements PipeTransform {
  public transform(path: string, year: number | null | undefined): Array<string | number> {
    const segments = path.split('/').filter((segment) => segment.length > 0);

    if (year === null || year === undefined) {
      return ['/' + segments.join('/')];
    }

    return ['/seasons', year, ...segments];
  }
}
