import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { BehaviorSubject, delay } from 'rxjs';

import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-revival-banner',
  templateUrl: './revival-banner.component.html',
  styleUrls: ['./revival-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe]
})
export class RevivalBannerComponent implements OnInit {
  private readonly ss = inject(SettingsService);
  private readonly env = inject(EnvironmentService);

  private _acknowledged$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public acknowledged$ = this._acknowledged$.asObservable().pipe(delay(25));
  public legacyHost: string;

  public ngOnInit(): void {
    this.ss
      .init({
        storage: {
          subKey: 'banners'
        },
        settings: {
          reskin_banner_acknowledge: {
            value: false,
            persistent: true
          }
        }
      })
      .subscribe((settings) => {
        this._acknowledged$.next(settings['reskin_banner_acknowledge'] as boolean);
      });

    this.legacyHost = this.env.value('legacy_host');
  }

  public dismiss() {
    this._acknowledged$.next(false);
    this.ss.updateSettings({
      reskin_banner_acknowledge: true
    });
  }
}
