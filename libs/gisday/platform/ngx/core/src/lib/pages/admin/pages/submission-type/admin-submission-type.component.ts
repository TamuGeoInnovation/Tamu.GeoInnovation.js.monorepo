import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'tamu-gisc-admin-submission-type',
    templateUrl: './admin-submission-type.component.html',
    styleUrls: ['./admin-submission-type.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLinkActive, RouterLink, RouterOutlet]
})
export class AdminSubmissionTypeComponent {}
