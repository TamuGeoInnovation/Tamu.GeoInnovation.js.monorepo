import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { Observable, Subject, filter, takeUntil } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { DrawerComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { ScrollToDirective } from '@tamu-gisc/ui-kits/ngx/interactions/scroll-to';
import { HamburgerTriggerComponent } from '@tamu-gisc/ui-kits/ngx/navigation/triggers';
import { TileNavigationComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileIconComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileTitleComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { TileLinkDirective } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tile';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-api',
  templateUrl: './geoservices-api.component.html',
  styleUrls: ['./geoservices-api.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    DrawerComponent,
    RouterLinkActive,
    RouterLink,
    ScrollToDirective,
    HamburgerTriggerComponent,
    TileNavigationComponent,
    TileComponent,
    TileIconComponent,
    TileTitleComponent,
    TileLinkDirective,
    RouterOutlet,
    AsyncPipe
  ]
})
export class GeoservicesApiComponent implements OnInit, OnDestroy {
  private readonly rs = inject(ResponsiveService);
  private readonly rt = inject(Router);

  @ViewChild('scrollContainer', { static: true })
  private container: ElementRef;

  public mobile: Observable<boolean>;
  public mobileNavToggle: Subject<boolean> = new Subject();

  private _$destroy: Subject<boolean> = new Subject();
  public ngOnInit(): void {
    this.mobile = this.rs.isMobile;

    // Because we are using an abnormal layout, we need to manually scroll to the top of the page on navigation.
    this.rt.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this._$destroy)
      )
      .subscribe(() => {
        this.container.nativeElement.scrollTop = 0;
      });
  }

  public ngOnDestroy(): void {
    this._$destroy.next(true);
    this._$destroy.complete();
  }
}
