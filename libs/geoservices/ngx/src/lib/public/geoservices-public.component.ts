import { Component, OnInit } from '@angular/core';
import { filter, Subject } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { growAnimationBuilder } from '@tamu-gisc/ui-kits/ngx/animations';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';

import { RevivalModalComponent } from '../core/components/modals/revival-modal/revival-modal.component';

@Component({
  selector: 'tamu-gisc-geoservices-public',
  templateUrl: './geoservices-public.component.html',
  styleUrls: ['./geoservices-public.component.scss'],
  animations: [growAnimationBuilder(250)]
})
export class GeoservicesPublicComponent implements OnInit {
  public mobileNavToggle: Subject<boolean> = new Subject();

  public url: string;

  constructor(
    public rp: ResponsiveService,
    private readonly env: EnvironmentService,
    private readonly ms: ModalService,
    private readonly ss: SettingsService
  ) {}

  public ngOnInit() {
    this.url = this.env.value('accounts_url');

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
        this.openBetaModal(true);
      });
  }

  public openBetaModal(shouldOpen: boolean) {
    if (shouldOpen) {
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
  }

  private updateModalSettings() {
    this.ss.updateSettings({
      reskin_acknowledge: true
    });
  }
}

