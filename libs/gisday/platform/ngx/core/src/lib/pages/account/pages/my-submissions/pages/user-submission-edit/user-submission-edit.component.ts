import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UserSubmissionAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
    selector: 'tamu-gisc-user-submission-edit',
    templateUrl: './user-submission-edit.component.html',
    styleUrls: ['./user-submission-edit.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [UserSubmissionAddEditFormComponent]
})
export class UserSubmissionEditComponent {}
