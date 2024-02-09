import { Component } from '@angular/core';

import { ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-db-reset-modal',
  templateUrl: './db-reset-modal.component.html',
  styleUrls: ['./db-reset-modal.component.scss']
})
export class DbResetModalComponent {
  constructor(private readonly modalRef: ModalRefService) {}

  public proceed() {
    this.modalRef.close(true);
  }

  public cancel() {
    this.modalRef.close(false);
  }
}
