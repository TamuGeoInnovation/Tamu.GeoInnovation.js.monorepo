import { Component, HostBinding, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, mergeMap, startWith, tap, toArray } from 'rxjs/operators';

import { ActiveSeasonDto, Place } from '@tamu-gisc/gisday/platform/data-api';
import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { GISDayRoles } from '../../roles/gisday.roles';
import { PlaceVisibilityOptions } from '../../enums/place-visibility-options.enum';
import { HamburgerTriggerComponent } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';
import { TileNavigationComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileIconComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileTitleComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileLinkDirective } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileSubmenuDirective } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileSubmenuComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { NgClass, AsyncPipe } from '@angular/common';
import { HasRolesPipe } from '@tamu-gisc/common/ngx/auth';
import { SeasonLinkPipe } from '../../pipes/season-link/season-link.pipe';
import { GISDAY_SITE, SiteHasPipe } from '../../site/site';
import { LockupComponent } from '@tamu-gisc/ui-kits/ngx/branding';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { AlertModalComponent, AlertModalData } from '@tamu-gisc/ui-kits/ngx/layout/modal/alert-modal';

@Component({
  selector: 'tamu-gisc-app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    SiteHasPipe,
    LockupComponent,
    HamburgerTriggerComponent,
    TileNavigationComponent,
    TileComponent,
    TileIconComponent,
    TileTitleComponent,
    TileLinkDirective,
    TileSubmenuDirective,
    TileSubmenuComponent,
    NgClass,
    RouterLink,
    AsyncPipe,
    HasRolesPipe,
    SeasonLinkPipe
  ]
})
export class HeaderComponent implements OnInit {
  private readonly as = inject(AuthService);
  public readonly site = inject(GISDAY_SITE);
  private readonly ss = inject(SeasonService);
  private readonly ps = inject(PlaceService);
  private readonly rt = inject(Router);
  private readonly at = inject(ActivatedRoute);
  private readonly ms = inject(ModalService);

  public loggedIn$: Observable<boolean>;
  public userRoles$: Observable<Array<string>>;
  public appRoles = GISDayRoles;
  public activeSeason$: Observable<ActiveSeasonDto>;
  public viewedYear$: Observable<number | null>;
  public places$: Observable<Array<Partial<Place>>>;

  public mobileNavToggle: Subject<boolean> = new Subject();
  public isAbsolute$: Observable<boolean>;
  public logoVisible$: Observable<boolean>;

  // This is used strictly for the seamless header on the landing page.
  // Ideally we'd use the same logoVisible$ observable, but
  // cannot return an observable from a getter HostBinding and have it
  // evaluated correctly.
  public readonly isHeaderSeamless = signal(false);

  @HostBinding('class.seamless')
  public get headerSeamless() {
    return this.isHeaderSeamless();
  }

  public ngOnInit() {
    this.loggedIn$ = this.as.isAuthenticated$;
    this.userRoles$ = this.as.userRoles$;
    // The year being looked at, so a past year's pages say which year they are (#1758).
    this.activeSeason$ = this.ss.viewedSeason$;
    this.viewedYear$ = this.ss.viewedYear$;
    this.places$ = this.ps.getEntitiesForActiveSeason().pipe(
      mergeMap((places) => places),
      filter((place) => place?.visibilitySettings && place.visibilitySettings.includes(PlaceVisibilityOptions.Header)),
      toArray()
    );

    const currUrl = this.rt.events.pipe(
      startWith(''),
      map(() => {
        return window.location.pathname;
      }),
      distinctUntilChanged()
    );

    // Header should not be visible when the activated route is the base route.
    this.logoVisible$ = currUrl.pipe(
      map((url) => {
        return url !== '/';
      }),
      distinctUntilChanged(),
      tap((visible) => {
        // Put on the next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isHeaderSeamless.set(!visible);
        }, 0);
      })
    );
  }

  public login() {
    const note = this.site.signInNote;

    if (!note) {
      this.signIn();
      return;
    }

    // Another organization's sign-in page comes next, and it does not say whose account it wants (#2662).
    this.ms
      .open<boolean>(AlertModalComponent, {
        data: {
          title: note.title,
          message: note.message,
          image: this.site.logo,
          imageAlt: this.site.name,
          primaryText: 'Continue',
          secondaryText: 'Cancel'
        } satisfies AlertModalData
      })
      .subscribe((go) => {
        if (go) {
          this.signIn();
        }
      });
  }

  private signIn() {
    this.as.login({
      appState: {
        target: this.rt.url
      }
    });
  }

  public logout() {
    const url = window.location.origin;

    this.as.logout({
      logoutParams: {
        returnTo: url,
        // A site that signs in with another organization's accounts ends that session too, at its provider. Auth0's
        // logout alone left UCGIS visitors signed in to Tradewing, so the next Login/Signup signed them straight back
        // in without a password (#2672). Not on the other sites: there it would sign people out of Google itself.
        ...(this.site.signInWith ? { federated: true } : {})
      }
    });
  }
}
