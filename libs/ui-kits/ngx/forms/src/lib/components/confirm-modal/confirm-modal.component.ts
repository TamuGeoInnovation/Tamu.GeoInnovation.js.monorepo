import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { MODAL_DATA, ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { ButtonComponent } from '../button/button.component';

/**
 * A question with two answers, for `ModalService` in `@tamu-gisc/ui-kits/ngx/layout/modal`.
 *
 * It lives here, beside the button it uses, rather than in the modal library: applications with
 * stricter compiler settings use the modal library, and importing the button there made them compile
 * this whole library too.
 * It closes with `true` for the confirm button and
 * `false` for the cancel button.
 *
 * ```ts
 * this.modalService
 *   .open<boolean>(ConfirmModalComponent, { data: { title: 'Delete?', message: '...', confirm: 'Delete' } })
 *   .subscribe((confirmed) => ...);
 * ```
 */
@Component({
  selector: 'tamu-gisc-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent]
})
export class ConfirmModalComponent {
  public readonly data = inject<ConfirmModalData>(MODAL_DATA);
  private readonly modalRef = inject(ModalRefService);

  public answer(confirmed: boolean) {
    this.modalRef.close(confirmed);
  }
}

export interface ConfirmModalData {
  title: string;
  message: string;

  /**
   * The confirm button's label. Defaults to "OK".
   */
  confirm?: string;

  /**
   * The cancel button's label. Defaults to "Cancel".
   */
  cancel?: string;
}
