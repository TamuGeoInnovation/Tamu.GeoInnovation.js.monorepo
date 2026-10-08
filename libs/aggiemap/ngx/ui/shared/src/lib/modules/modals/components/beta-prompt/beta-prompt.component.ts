import { Component, ChangeDetectionStrategy } from '@angular/core';

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
  constructor(private readonly mr: ModalRefService) {}

  public close() {
    this.mr.close(true);
  }
}
