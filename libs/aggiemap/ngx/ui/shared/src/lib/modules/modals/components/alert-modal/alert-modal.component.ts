import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

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
  styleUrls: ['./alert-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ButtonComponent]
})
export class AlertModalComponent {
  private readonly mr = inject(ModalRefService);
  private readonly ss = inject(SettingsService);
  private readonly data = inject<AlertModalData>(MODAL_DATA);

  public title: string;
  public message: string;
  public primaryText: string;
  public secondaryText?: string;

  constructor() {
    const data = this.data;

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
