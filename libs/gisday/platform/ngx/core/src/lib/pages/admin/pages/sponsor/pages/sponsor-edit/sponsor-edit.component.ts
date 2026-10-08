import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SponsorAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
    selector: 'tamu-gisc-sponsor-edit',
    templateUrl: './sponsor-edit.component.html',
    styleUrls: ['./sponsor-edit.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SponsorAddEditFormComponent]
})
export class SponsorEditComponent {}
