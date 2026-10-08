import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TagAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
    selector: 'tamu-gisc-tags-edit',
    templateUrl: './tags-edit.component.html',
    styleUrls: ['./tags-edit.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [TagAddEditFormComponent]
})
export class TagsEditComponent {}
