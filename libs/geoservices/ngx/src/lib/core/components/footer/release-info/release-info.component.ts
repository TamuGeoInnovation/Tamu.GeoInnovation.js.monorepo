import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

import { EnvironmentService, ReleaseMetadata } from '@tamu-gisc/common/ngx/environment';
import { ClipboardCopyDirective } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

@Component({
  selector: 'tamu-gisc-release-info',
  templateUrl: './release-info.component.html',
  styleUrls: ['./release-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ClipboardCopyDirective]
})
export class ReleaseInfoComponent implements OnInit {
  private readonly env = inject(EnvironmentService);

  public release_meta: ReleaseMetadata;

  public ngOnInit(): void {
    this.release_meta = this.env.value('metadata');
  }
}
