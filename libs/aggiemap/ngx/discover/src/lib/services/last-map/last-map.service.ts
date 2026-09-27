import { Injectable } from '@angular/core';
import { NavigationEnd, Params, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Remembers the last map the visitor was looking at, so the discover pages can offer a way back to
 * it rather than always to the main campus map.
 *
 * Someone who opens All Maps from the Kickoff at Kyle map expects "back" to return them there. A
 * fixed link to `/map` silently loses their place, and the browser's own back button is not an
 * option on a page that may have been opened from a shared link.
 */
@Injectable({ providedIn: 'root' })
export class LastMapService {
  /**
   * Route prefixes that render a map. Everything else - All Maps and its detail pages, About,
   * Changelog, Directory, Feedback - is a page about the maps rather than a map.
   */
  private static readonly MAP_ROUTE_PREFIXES = ['/map', '/events/', '/parking/', '/operations/', '/campus/', '/kiosk/'];

  /** Survives a reload of a discover page, which would otherwise reset the visitor to the default. */
  private static readonly STORAGE_KEY = 'aggiemap:last-map-url';

  private static readonly DEFAULT_URL = '/map';

  private _url: string = LastMapService.DEFAULT_URL;

  constructor(private readonly router: Router) {
    this._url = this.restore();

    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      const url = event.urlAfterRedirects;

      if (!LastMapService.isMapUrl(url)) {
        return;
      }

      this._url = url;
      this.persist(url);
    });
  }

  /**
   * The last map visited, or the main campus map if this is the visitor's first page.
   *
   * This is the whole URL, query string and fragment included. Do **not** bind it to `[routerLink]`:
   * a string is treated as a path, so any `?` and `=` are percent-encoded into it and the link routes
   * nowhere. Bind `path`, `queryParams` and `fragment` instead -- `routerLink` in Angular 15 takes
   * no `UrlTree`, so the parts have to be passed separately.
   */
  public get url(): string {
    return this._url;
  }

  /** The path alone, safe to bind to `[routerLink]`. */
  public get path(): string {
    const tree = this.router.parseUrl(this._url);

    tree.queryParams = {};
    tree.fragment = null;

    return this.router.serializeUrl(tree);
  }

  /** Query parameters of the last map, for `[queryParams]`. Empty when it had none. */
  public get queryParams(): Params {
    return this.router.parseUrl(this._url).queryParams;
  }

  /** Fragment of the last map, for `[fragment]`. `undefined` when it had none. */
  public get fragment(): string | undefined {
    return this.router.parseUrl(this._url).fragment ?? undefined;
  }

  private static isMapUrl(url: string): boolean {
    // `/map` exactly, or `/map` followed by a separator, but not a route that merely starts with
    // those letters. `#` is in the list because a fragment is as much a boundary as `?` or `/`, and
    // omitting it meant `/map#north` was not recognised as a map at all.
    return LastMapService.MAP_ROUTE_PREFIXES.some((prefix) => {
      if (prefix.endsWith('/')) {
        return url.startsWith(prefix);
      }

      return url === prefix || ['?', '#', '/'].some((separator) => url.startsWith(`${prefix}${separator}`));
    });
  }

  private restore(): string {
    try {
      return window.sessionStorage.getItem(LastMapService.STORAGE_KEY) || LastMapService.DEFAULT_URL;
    } catch {
      // Private browsing and blocked site data both throw here. The default is fine.
      return LastMapService.DEFAULT_URL;
    }
  }

  private persist(url: string): void {
    try {
      window.sessionStorage.setItem(LastMapService.STORAGE_KEY, url);
    } catch {
      // Not being able to remember across a reload is not worth failing navigation over.
    }
  }
}
