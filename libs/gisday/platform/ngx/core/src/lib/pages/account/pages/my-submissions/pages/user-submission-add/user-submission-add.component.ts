import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UserSubmissionAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
    selector: 'tamu-gisc-user-submission-add',
    templateUrl: './user-submission-add.component.html',
    styleUrls: ['./user-submission-add.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [UserSubmissionAddEditFormComponent]
})
export class UserSubmissionAddComponent {}
