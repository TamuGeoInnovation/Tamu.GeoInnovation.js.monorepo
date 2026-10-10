import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-beta-prompt',
  templateUrl: './beta-prompt.component.html',
  styleUrls: ['./beta-prompt.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ButtonComponent]
})
export class BetaPromptComponent {
  private readonly mr = inject(ModalRefService);


  public close() {
    this.mr.close(true);
  }
}
