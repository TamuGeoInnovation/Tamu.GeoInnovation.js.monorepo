import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-beta-prompt',
  templateUrl: './beta-prompt.component.html',
  styleUrls: ['./beta-prompt.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class BetaPromptComponent {
  constructor(private readonly mr: ModalRefService) {}

  public close() {
    this.mr.close(true);
  }
}
