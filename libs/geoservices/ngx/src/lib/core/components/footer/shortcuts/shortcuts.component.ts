import { Component, ChangeDetectionStrategy } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'tamu-gisc-footer-shortcuts',
    templateUrl: './shortcuts.component.html',
    styleUrls: ['./shortcuts.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class FooterShortcutsComponent {
  public legacyHost: string = this.env.value('legacy_host');

  constructor(private readonly env: EnvironmentService) {}
}
