import { Component } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-footer-shortcuts',
  templateUrl: './shortcuts.component.html',
  styleUrls: ['./shortcuts.component.scss']
})
export class FooterShortcutsComponent {
  public legacyHost: string = this.env.value('legacy_host');

  constructor(private readonly env: EnvironmentService) {}
}
