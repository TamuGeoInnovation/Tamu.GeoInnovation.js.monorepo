import { Component, inject } from '@angular/core';
import { MODAL_DATA } from '../../tokens/modal.tokens';
import { ModalRefService } from '../../services/modal-ref/modal-ref.service';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

export interface AlertModalData {
  title?: string;
  message?: string;
  primaryText?: string;
  secondaryText?: string;
  persistKey?: string;
  /**
   * An image shown above the title, such as the logo of the organization the message is about. GIS Day's UCGIS
   * site shows UCGIS's before sending someone to UCGIS's own sign-in page (#2662).
   */
  image?: string;
  /** The image's text alternative. Empty when the title already says what it shows. */
  imageAlt?: string;
}

@Component({
  selector: 'tamu-gisc-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss'],
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
  public image?: string;
  public imageAlt: string;

  constructor() {
    const data = this.data;

    this.title = data?.title || '';
    this.message = data?.message || '';
    this.primaryText = data?.primaryText || 'OK';
    this.secondaryText = data?.secondaryText;
    this.image = data?.image;
    this.imageAlt = data?.imageAlt ?? '';
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
