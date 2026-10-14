import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

import { MODAL_DATA } from '../../tokens/modal.tokens';
import { ModalRefService } from '../../services/modal-ref/modal-ref.service';

/**
 * A question with two answers, for `ModalService.open`. It closes with `true` for the confirm button and
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
