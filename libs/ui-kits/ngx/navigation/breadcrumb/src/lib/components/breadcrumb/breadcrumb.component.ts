import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Route, Routes } from '@angular/router';

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
  public limit = 2;

  public path = [];

  private routes: Routes;

  constructor(private router: Router, private route: ActivatedRoute) {}

  public ngOnInit() {
    this.routes = this.extractRoutes(this.route);

    const history = this.matchRoutes(this.routes, this.router.url);
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
        .map((i) => {
          if (rt.parent) {
            return extract(rt.parent, [...p, rt.routeConfig]);
          } else {
            return parents;
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
      .reverse()
      .reduce((acc, curr) => {
        return [...acc, ...curr.children];
      }, []);
  }

  private matchRoutes(routes: Routes, url: string | string[], matchDepth?: number) {
    const depth = matchDepth ? matchDepth : 0;
    // If `url` is string, make into array of params. If Array, use that.
    const params = url instanceof Array ? url : url.split('/').filter((s) => s.length > 0);

    // Root of the application. Nothing else to do.
    if (params.length === 0) {
      return;
    }

    if (depth > 0) {
      // Handle non-matching, multi depth routes
      const match = this.matchRoute(routes, params.slice(0, depth));
    } else {
      const match = this.matchRoute(routes, [params[depth]]);

      if (match === undefined) {
        const s = this.matchRoutes(routes, [...params], depth + 1);

        debugger;
      }

      // If the matching route has load children,
      if (match > -1) {
        if (routes[match].loadChildren) {
          this.path.push(routes[match + 1]);
        }
      }
    }

    // for (let i = 0; i <= params.length; i++) {

    // }
  }

  private matchRoute(routes: Routes, segments: Array<string>): number {
    const exactMatchIndex = routes.findIndex((rt) => rt.path === segments.join('/'));

    return exactMatchIndex;
  }
}
