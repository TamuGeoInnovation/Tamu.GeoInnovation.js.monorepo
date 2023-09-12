import { Component, HostListener, OnInit } from '@angular/core';
import { Observable, Subject, delay, filter, merge, of, startWith, switchMap } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { growAnimationBuilder } from '@tamu-gisc/ui-kits/ngx/animations';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { AuthService, LoggedInState } from '@tamu-gisc/geoservices/data-access';

import { RevivalModalComponent } from '../modals/revival-modal/revival-modal.component';

@Component({
  selector: 'tamu-gisc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [growAnimationBuilder(250)]
})
export class HeaderComponent implements OnInit {
  public mobileNavToggle: Subject<boolean> = new Subject();
  public loggedIn: Observable<LoggedInState>;
  public url: string;

  // Because the routing is virtual, the header component is not destroyed when navigating between routes.
  // This is a means to remove the dropdown menu when the user clicks on a link using pointer events as the mechanism.
  // When pointer events are ignored, the hover states are no longer triggered and CSS takes care of hiding the dropdown.
  private _$ignorePointerEvents: Subject<boolean> = new Subject();
  public ignorePointerEvents: Observable<boolean>;

  @HostListener('click', ['$event'])
  private _onLinkClick(e: MouseEvent) {
    if (e.target instanceof HTMLAnchorElement) {
      this._$ignorePointerEvents.next(true);
    }
  }

  constructor(
    private readonly as: AuthService,
    private readonly env: EnvironmentService,
    private readonly ms: ModalService,
    private readonly ss: SettingsService,
    public readonly rs: ResponsiveService
  ) {}

  public ngOnInit() {
    this.loggedIn = this.as.state;
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
