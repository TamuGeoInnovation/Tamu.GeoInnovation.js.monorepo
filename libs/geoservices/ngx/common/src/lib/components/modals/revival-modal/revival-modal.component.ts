import { Component } from '@angular/core';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { ModalRefService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-revival-modal',
  templateUrl: './revival-modal.component.html',
  styleUrls: ['./revival-modal.component.scss']
})
export class RevivalModalComponent {
  public legacyHost: string = this.env.value('legacy_host');

  constructor(private readonly mr: ModalRefService, private readonly env: EnvironmentService) {}

  public dismiss() {
    this.mr.close(true);
  }
}
