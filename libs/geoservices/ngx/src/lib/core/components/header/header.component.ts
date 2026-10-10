import { Component, HostListener, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Observable, Subject, delay, filter, map, merge, of, startWith, switchMap } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { growAnimationBuilder } from '@tamu-gisc/ui-kits/ngx/animations';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { AuthService } from '@tamu-gisc/geoservices/data-access';

import { RevivalModalComponent } from '../modals/revival-modal/revival-modal.component';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { NgClass, AsyncPipe } from '@angular/common';
import { RevivalBannerComponent } from '../revival-banner/revival-banner.component';
import { HeaderMobileComponent } from '../header-mobile/header-mobile.component';
import { HamburgerTriggerComponent } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';
import { TileNavigationComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileIconComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileTitleComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileSubmenuDirective } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileSubmenuComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { AccordionDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentDirective } from '@tamu-gisc/ui-kits/ngx/layout';
import { TileLinkDirective } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';

@Component({
  selector: 'tamu-gisc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [growAnimationBuilder(250)],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    RouterLinkActive,
    RouterLink,
    NgClass,
    RevivalBannerComponent,
    HeaderMobileComponent,
    HamburgerTriggerComponent,
    TileNavigationComponent,
    TileComponent,
    TileIconComponent,
    TileTitleComponent,
    TileSubmenuDirective,
    TileSubmenuComponent,
    AccordionDirective,
    AccordionHeaderDirective,
    AccordionContentDirective,
    TileLinkDirective,
    AsyncPipe
  ]
})
export class HeaderComponent implements OnInit {
  private readonly as = inject(AuthService);
  private readonly env = inject(EnvironmentService);
  private readonly ms = inject(ModalService);
  private readonly ss = inject(SettingsService);
  readonly rs = inject(ResponsiveService);

  public mobileNavToggle: Subject<boolean> = new Subject();
  public loggedIn: Observable<boolean>;
  public isManager: Observable<boolean>;
  public url: string;

  // Because the routing is virtual, the header component is not destroyed when navigating between routes.
  // This is a means to remove the dropdown menu when the user clicks on a link using pointer events as the mechanism.
  // When pointer events are ignored, the hover states are no longer triggered and CSS takes care of hiding the dropdown.
  private _$ignorePointerEvents: Subject<boolean> = new Subject();
  public ignorePointerEvents: Observable<boolean>;

  @HostListener('click', ['$event'])
  protected _onLinkClick(e: MouseEvent) {
    if (e.target instanceof HTMLAnchorElement) {
      this._$ignorePointerEvents.next(true);
    }
  }

  public ngOnInit() {
    this.loggedIn = this.as.state.pipe(
      map((state) => {
        return state.loggedIn;
      }),
      startWith(false)
    );

    this.isManager = this.as.state.pipe(
      map((state) => {
        return state.isManager;
      }),
      startWith(false)
    );

    this.url = this.env.value('accounts_url');

    // Only set ignore pointer events for a brief period of time so that users
    // can re-engage with the dropdown after clicking on a link.
    this.ignorePointerEvents = this._$ignorePointerEvents.asObservable().pipe(
      // When true is emitted, wait 1 second and then emit false.
      switchMap((v) => {
        return merge(of(v), of(!v).pipe(delay(250)));
      }),
      startWith(false)
    );

    this.ss
      .init({
        storage: {
          subKey: 'modals'
        },
        settings: {
          reskin_acknowledge: {
            value: false,
            persistent: true
          }
        }
      })
      .pipe(
        filter((settings) => {
          return settings['reskin_acknowledge'] === false;
        })
      )
      .subscribe(() => {
        this.openModal();
      });
  }

  public openModal() {
    this.ms
      .open<boolean>(RevivalModalComponent)
      .pipe(
        filter((acknowledged) => {
          return acknowledged;
        })
      )
      .subscribe(() => {
        this.updateModalSettings();
      });
  }

  private updateModalSettings() {
    this.ss.updateSettings({
      reskin_acknowledge: true
    });
  }
}
