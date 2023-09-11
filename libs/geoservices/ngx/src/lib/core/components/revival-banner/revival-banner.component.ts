import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, delay } from 'rxjs';

import { SettingsService } from '@tamu-gisc/common/ngx/settings';

@Component({
  selector: 'tamu-gisc-revival-banner',
  templateUrl: './revival-banner.component.html',
  styleUrls: ['./revival-banner.component.scss']
})
export class RevivalBannerComponent implements OnInit {
  private _acknowledged$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public acknowledged$ = this._acknowledged$.asObservable().pipe(delay(25));

  constructor(private readonly ss: SettingsService) {}

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
  }

  public dismiss() {
    this._acknowledged$.next(false);
    this.ss.updateSettings({
      reskin_banner_acknowledge: true
    });
  }
}

