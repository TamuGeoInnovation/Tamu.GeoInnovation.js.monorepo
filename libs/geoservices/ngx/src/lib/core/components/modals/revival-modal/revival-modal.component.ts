import { Component } from '@angular/core';

import { ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-revival-modal',
  templateUrl: './revival-modal.component.html',
  styleUrls: ['./revival-modal.component.scss']
})
export class RevivalModalComponent {
  constructor(private readonly mr: ModalRefService) {}

  public dismiss() {
    this.mr.close(true);
  }
}
