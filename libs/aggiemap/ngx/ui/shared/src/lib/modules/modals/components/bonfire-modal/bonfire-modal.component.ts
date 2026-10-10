import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-bonfire-modal',
  templateUrl: './bonfire-modal.component.html',
  styleUrls: ['./bonfire-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ButtonComponent]
})
export class BonfireModalComponent {
  private readonly mr = inject(ModalRefService);


  public close(acknowledge?: boolean) {
    this.mr.close(acknowledge);
  }
}
