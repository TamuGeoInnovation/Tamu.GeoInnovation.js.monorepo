import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private title: Title,
    private router: Router,
    private route: ActivatedRoute,
    private readonly os: OidcSecurityService
  ) {}

  public ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let child = this.route.firstChild;

          while (child.firstChild) {
            child = child.firstChild;
          }

          if (child.snapshot.data['title']) {
            return child.snapshot.data['title'];
          }

          return undefined;
        })
      )
      .subscribe((ttl: string) => {
        this.title.setTitle(this._pageTitle(ttl));
      });

    this.os.checkAuth().subscribe(({ isAuthenticated }) => {
      console.log('Authenticated', isAuthenticated);
    });
  }

  private _pageTitle(fragment?: string) {
    const titleBase = 'Coastal Community Planning Atlas';

    if (fragment !== undefined) {
      return `${fragment} | ${titleBase}`;
    } else {
      return titleBase;
    }
  }
}
