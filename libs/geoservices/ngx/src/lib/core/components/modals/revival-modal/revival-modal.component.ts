import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
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
  private readonly mr = inject(ModalRefService);
  private readonly env = inject(EnvironmentService);

  public legacyHost: string = this.env.value('legacy_host');

  public dismiss() {
    this.mr.close(true);
  }
}
