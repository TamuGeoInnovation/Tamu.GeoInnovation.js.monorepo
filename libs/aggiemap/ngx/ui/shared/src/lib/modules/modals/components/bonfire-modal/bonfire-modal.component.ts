import { Component } from '@angular/core';

import { ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-bonfire-modal',
  templateUrl: './bonfire-modal.component.html',
  styleUrls: ['./bonfire-modal.component.scss']
})
export class BonfireModalComponent {
  constructor(private readonly mr: ModalRefService) {}

  public close(acknowledge?: boolean) {
    this.mr.close(acknowledge);
  }
}
