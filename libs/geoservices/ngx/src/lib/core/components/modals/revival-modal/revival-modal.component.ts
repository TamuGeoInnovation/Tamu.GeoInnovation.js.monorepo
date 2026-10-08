import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tamu-gisc-revival-modal',
  templateUrl: './revival-modal.component.html',
  styleUrls: ['./revival-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink]
})
export class RevivalModalComponent {
  public legacyHost: string = this.env.value('legacy_host');

  constructor(
    private readonly mr: ModalRefService,
    private readonly env: EnvironmentService
  ) {}

  public dismiss() {
    this.mr.close(true);
  }
}
