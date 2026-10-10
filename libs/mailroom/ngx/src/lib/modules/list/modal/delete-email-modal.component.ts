import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { catchError, of } from 'rxjs';

import { EmailService } from '@tamu-gisc/mailroom/data-access';
import { ModalRefService, MODAL_DATA } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-modal',
  templateUrl: './delete-email-modal.component.html',
  styleUrls: ['./delete-email-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class DeleteEmailModalComponent {
  readonly data = inject<{
    message: number;
  }>(MODAL_DATA);
  private readonly modalRef = inject(ModalRefService);
  readonly emailService = inject(EmailService);

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
