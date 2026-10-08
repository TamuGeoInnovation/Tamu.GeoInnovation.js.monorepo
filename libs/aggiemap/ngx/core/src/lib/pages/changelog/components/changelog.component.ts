import { Component, ChangeDetectionStrategy } from '@angular/core';

import { events } from '../changelog-events';
import { RouterLink } from '@angular/router';
import { AggiemapNgxSharedUiStructuralModule } from '@tamu-gisc/aggiemap/ngx/ui/shared';
import { DatePipe } from '@angular/common';
import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

@Component({
    selector: 'tamu-gisc-aggiemap-changelog',
    templateUrl: './changelog.component.html',
    styleUrls: ['./changelog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, AggiemapNgxSharedUiStructuralModule, DatePipe, PipesModule]
})
export class ChangelogComponent {
  public changelogEvents = events;
}
