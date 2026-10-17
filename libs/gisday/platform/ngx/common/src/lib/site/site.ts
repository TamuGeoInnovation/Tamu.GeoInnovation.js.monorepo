import { InjectionToken, Pipe, PipeTransform, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { GisdayFeature, GisdaySite, gisdaySite, siteHas } from '@tamu-gisc/gisday/common';

/**
 * The site this deployment is (#1835). The app provides it from `ANGULAR_SITE`; anything that does
 * not, such as a component under test, gets txgisday.org.
 */
export const GISDAY_SITE = new InjectionToken<GisdaySite>('GISDAY_SITE', {
  providedIn: 'root',
  factory: () => gisdaySite()
});

/**
 * Whether this site has a feature, for templates.
 *
 * @example @if ('faq' | siteHas) { <a [routerLink]="['/faq']">FAQ</a> }
 */
@Pipe({ name: 'siteHas' })
export class SiteHasPipe implements PipeTransform {
  private readonly site = inject(GISDAY_SITE);

  public transform(feature: GisdayFeature): boolean {
    return siteHas(this.site, feature);
  }
}

/**
 * Keeps a feature's pages out of reach on a site that leaves it out, so a typed-in address goes to
 * the homepage rather than to a page the site has no menu for.
 */
export function siteFeatureGuard(feature: GisdayFeature): CanActivateFn {
  return () => siteHas(inject(GISDAY_SITE), feature) || inject(Router).createUrlTree(['/']);
}
