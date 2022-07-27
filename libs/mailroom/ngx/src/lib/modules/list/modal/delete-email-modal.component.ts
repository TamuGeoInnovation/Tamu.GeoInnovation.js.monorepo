import { Component, Inject } from '@angular/core';

import { catchError, of } from 'rxjs';

import { EmailService } from '@tamu-gisc/mailroom/data-access';
import { ModalRefService, MODAL_DATA } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-modal',
  templateUrl: './delete-email-modal.component.html',
  styleUrls: ['./delete-email-modal.component.scss']
})
export class DeleteEmailModalComponent {
  constructor(
    @Inject(MODAL_DATA) public readonly data: { message: number },
    private readonly modalRef: ModalRefService,
    public readonly emailService: EmailService
  ) {}

  public deleteEmail() {
    this.emailService
      .deleteEmail(this.data.message)
      .pipe(catchError(() => of(false)))
      .subscribe((deleted) => {
        this.closeModal(deleted);
      });
  }

  public closeModal(deleted: boolean) {
    this.modalRef.close({
      deleted
    });
  }
}
