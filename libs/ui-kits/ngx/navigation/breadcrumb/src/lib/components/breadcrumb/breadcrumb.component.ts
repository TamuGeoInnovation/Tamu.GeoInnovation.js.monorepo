import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Route, Routes, Event, NavigationEnd } from '@angular/router';
import { merge, of, BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  /**
   * Number of breadcrumbs to show
   */
  @Input()
  public limit = 3;

  private _crumbs: BehaviorSubject<Crumbs> = new BehaviorSubject([]);

  public crumbs: Observable<Crumbs> = this._crumbs.asObservable();

  private routes: Routes;

  constructor(private router: Router, private route: ActivatedRoute) {}

  public ngOnInit() {
    this.routes = this.extractRoutes(this.route);

    const routerNavigationTrigger = this.router.events.pipe(
      filter((event: Event) => {
        return event instanceof NavigationEnd;
      })
    );

    merge(routerNavigationTrigger, of(true)).subscribe(() => {
      this.cleanCrumbs();

      this.matchRoutes(this.routes, this.router.url);
    });
  }

  public follow(path) {
    this.router.navigate([path]);
  }

  private dropCrumb(crumb: Crumb) {
    const trail = JSON.parse(JSON.stringify(this._crumbs.getValue()));
    const drop = JSON.parse(JSON.stringify(crumb));

    let pile = [...trail, drop];

    if (pile.length > this.limit) {
      pile = pile.splice(pile.length - this.limit, pile.length - 1);
    }

    this._crumbs.next(pile);
  }

  private cleanCrumbs(): void {
    this._crumbs.next([]);
  }

  /**
   * Returns an array of feature module route configurations.
   */
  private extractRoutes(route: ActivatedRoute): Routes {
    const extract = (rt?: ActivatedRoute, parents?: Routes) => {
      // Default if no parents aren't provided.
      const p = parents ? parents : [];

      return Array(1)
        .fill(undefined)
        .map(() => {
          if (rt.parent) {
            return extract(rt.parent, [...p, rt.routeConfig]);
          } else {
            return p;
          }
        })
        .flat();
    };

    // Only return route configurations with child routes.
    //
    // Routes for configurations WITHOUT child routes (only `loadChildren`) are assumed
    // to be defined in the target feature module.
    return extract(route)
      .filter((rt) => {
        return rt.children;
      })
      .reverse();
  }

  private matchRoutes(rootModules: Routes, url: string | string[], matchDepth?: number) {
    const depth = matchDepth ? matchDepth : 0;
    // If `url` is string, make into array of params. If Array, use that.
    const params = url instanceof Array ? url : url.split('/').filter((s) => s.length > 0);

    // Create separate array with only the segments that need to be matched
    const matchParams = params.slice(0, depth + 1);

    // Root of the application. Nothing else to do.
    if (params.length === 0) {
      return;
    }

    const moduleMatch = this.matchModule(rootModules, matchParams);

    // If a match was found
    if (moduleMatch === undefined) {
      if (matchDepth !== params.length) {
        this.matchRoutes(rootModules, [...params], depth + 1);
      }
    } else {
      const route = this.matchRoute(moduleMatch, matchParams);

      if (route) {
        const text: string = route.data && route.data.breadcrumb ? route.data.breadcrumb : params[depth];

        // Save the determined path breadcrumb text and path.
        // this.dropCrumb({ text, path: route.path });
        this.dropCrumb({ text, path: this.mapSegments(moduleMatch, route.path.split('/'), matchParams) });

        // Check if there are any other params to match to routes.
        //
        // If so, call self again with a different match depth.
        if (depth < params.length - 1) {
          // If the module match was found in a subsequent module, this means
          // the matched route is found in a lazy loaded module, where the current
          // match params and depth will no longer be relevant to subsequent matches.
          //
          // In this case, remove the current url param being used from the match from the url
          // params for the next match.
          if (moduleMatch.code === resultStatus.NEXT_MODULE) {
            this.matchRoutes(rootModules, [...params.slice(depth + 1, params.length)], 0);
          } else {
            // Otherwise, if the module match is found in the same module, the next route match
            // will likely be a sibling
            this.matchRoutes(rootModules, [...params], depth + 1);
          }
        }
      } else {
        console.log(`Could not match a route to,`, route);
      }
    }
  }

  /**
   * Returns a matching child route object from a provided list of route segments.
   */
  private matchRoute(result: IModuleResult, segments?: Array<string>): Route {
    // Handle not having provided a result, a result without module, or a result module without children.
    //
    // Can't try to match anything without route children,
    if (!result || !result.module || !result.module.children) {
      return;
    }

    // If a module was matched and the status code represents the matching route to
    // be that of the subsequent route in the series, assume the first route is correct.
    //
    // This is one of the most simple cases to address.
    if (result.code === resultStatus.NEXT_MODULE) {
      return result.module.children[0];
    }

    if (result.code === resultStatus.FOUND) {
      return this.determineRoute(result.module, segments);
    }
  }

  private determineRoute(m: Route, segments: Array<string>): Route {
    if (m && m.children) {
      const path = segments.join('/');

      const route = m.children.find((rt) => {
        const rtSegments = rt.path.split('/');

        const sameSegmentSize = rtSegments.length === segments.length;

        // If the routes don't have the same segment size, don't bother with
        // other matching tests
        if (!sameSegmentSize) {
          return false;
        }

        // Check if path names are an exact match.
        // This is easiest and best case scenario.
        if (path === rt.path) {
          return true;
        }

        /**
         * Compares all of the segments of the route and determines if ALL they are equal or acceptable.
         *
         * Routes with parameters (e.g. ":guid") will resolve truthy for any value.
         */
        const segmentsMatch = (sourceSegments: Array<string>, routeSegments: Array<string>): boolean => {
          const test = routeSegments.map((sourceSegment, index) => {
            const segmentIsParam = sourceSegment.includes(':');

            // If the segment contains a colon, treat it as a route parameter.
            if (segmentIsParam) {
              return true;
            }

            // Check if the source segment at the current index is exactly the same
            // as the current segment
            if (sourceSegment === sourceSegments[index]) {
              return true;
            }

            // If none of the previous tests passed, default to a failed test result
            return false;
          });

          // Determine if all of the tests were successful. If they are, the route matches
          const allMatch = !test.includes(false);

          return allMatch;
        };

        if (segmentsMatch(segments, rtSegments)) {
          return true;
        }

        // Default `false` value
        return false;
      });

      return route;
    } else {
      return undefined;
    }
  }

  /**
   * Returns a matching feature module routing configuration from a collection based on the
   * provided route segments.
   */
  private matchModule(modules: Routes, segments: Array<string>): IModuleResult {
    const correspondingModule: IModuleResult = modules.reduce(
      (acc, curr, index) => {
        if (acc.code === resultStatus.NEXT_MODULE || acc.code === resultStatus.FOUND) {
          return acc;
        }

        // Attempt to find a EXACT route match by name using the provided path segments
        //
        // If a route is a PARTIAL match, then the module matching will fail altogether and
        // be called again with more route segments.

        const child = this.determineRoute(curr, segments);

        const status: IModuleResult = {};

        // End early. The calling function will try to call this function again with more
        // route segments
        if (child === undefined) {
          status.code = resultStatus.NOT_FOUND;

          return status;
        }

        // If a child route was found, but has loadChildren instead
        // of children route definitions, assume the next module has the
        // initial route for the loaded module.
        if (child && child.loadChildren) {
          status.code = resultStatus.NEXT_MODULE;
          status.moduleIndex = index;

          return status;
        }

        // If a child route was found, and contains child route definitions,
        // return match the segment with this module.
        //
        // The next step, outside the scope of this function will be to pluck the exact
        // child route
        if (child || child.children) {
          status.code = resultStatus.FOUND;
          status.module = curr;

          return status;
        }
      },
      {
        code: undefined,
        module: undefined
      } as IModuleResult
    );

    if (correspondingModule.code === resultStatus.FOUND) {
      return correspondingModule;
    } else if (correspondingModule.code === resultStatus.NEXT_MODULE) {
      return {
        code: correspondingModule.code,
        module: modules[correspondingModule.moduleIndex + 1]
      };
    } else {
      return undefined;
    }
  }

  /**
   * Maps a set of active url route path segments into their correct route segments.
   *
   * @param moduleResult Module matching result. It's result code is used to determine some mappings
   * @param sourceSegments Config path segments
   * @param routeSegments Active route path segments
   */
  private mapSegments(moduleResult: IModuleResult, sourceSegments: Array<string>, routeSegments: Array<string>): string {
    const mapped = routeSegments.map((sourceSegment, index) => {
      const segmentIsParam = sourceSegment.includes(':');

      // If the route to navigate exists within an lazy-loaded module,
      // use the source segment, instead
      if (moduleResult.code === resultStatus.NEXT_MODULE) {
        return sourceSegments[index];
      }

      if (segmentIsParam) {
        return routeSegments[index];
      } else {
        return sourceSegment;
      }
    });

    return mapped.join('/');
  }
}

export interface Crumb {
  text: string;
  path: string;
}

export type Crumbs = Array<Crumb>;

export interface IModuleResult {
  code?: number;
  module?: Route;
  moduleIndex?: number;
}

export enum resultStatus {
  NOT_FOUND = 0,
  NEXT_MODULE = 1,
  FOUND = 2
}
