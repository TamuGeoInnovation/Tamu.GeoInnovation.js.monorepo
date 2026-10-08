import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SubmitBugFormComponent } from '../../../../../core/modules/forms/submit-bug-form/submit-bug-form.component';

@Component({
  selector: 'tamu-gisc-bug-report',
  templateUrl: './bug-report.component.html',
  styleUrls: ['./bug-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SubmitBugFormComponent]
})
export class BugReportComponent {}
