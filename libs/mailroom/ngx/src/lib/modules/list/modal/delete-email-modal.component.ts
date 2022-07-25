import { Component, Inject } from '@angular/core';

import { ModalRefService, MODAL_DATA } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-modal',
  templateUrl: './delete-email-modal.component.html',
  styleUrls: ['./delete-email-modal.component.scss']
})
export class DeleteEmailModalComponent {
  constructor(@Inject(MODAL_DATA) public readonly data: { message: string }, private readonly modalRef: ModalRefService) {}

  public closeModal() {
    this.modalRef.close({
      deleteEmail: true
    });
  }
}
