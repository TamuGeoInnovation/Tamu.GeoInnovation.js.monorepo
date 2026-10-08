import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ClassAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
    selector: 'tamu-gisc-class-add',
    templateUrl: './class-add.component.html',
    styleUrls: ['./class-add.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ClassAddEditFormComponent]
})
export class ClassAddComponent {}
