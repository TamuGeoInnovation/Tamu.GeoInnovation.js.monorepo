import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

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
  private readonly env = inject(EnvironmentService);

  public legacyHost: string = this.env.value('legacy_host');
}
