import { Component, Inject } from '@angular/core';
import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';

export interface AlertModalData {
  title?: string;
  message?: string;
  primaryText?: string;
  secondaryText?: string;
  persistKey?: string;
}

@Component({
  selector: 'tamu-gisc-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss']
})
export class AlertModalComponent {
  public title: string;
  public message: string;
  public primaryText: string;
  public secondaryText?: string;

  constructor(private readonly mr: ModalRefService, private readonly ss: SettingsService, @Inject(MODAL_DATA) private readonly data: AlertModalData) {
    this.title = data?.title || '';
    this.message = data?.message || '';
    this.primaryText = data?.primaryText || 'OK';
    this.secondaryText = data?.secondaryText;
  }

  public primary() {
    if (this.data?.persistKey) {
      // Persist dismissal using SettingsService update flow
      this.ss.updateSettings({ [this.data.persistKey]: true });
    }
    this.mr.close(true);
  }

  public secondary() {
    this.mr.close(false);
  }
}
