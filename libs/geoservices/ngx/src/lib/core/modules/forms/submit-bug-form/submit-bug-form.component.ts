import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ContactService } from '@tamu-gisc/geoservices/data-access';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

@Component({
  selector: 'tamu-gisc-submit-bug-form',
  templateUrl: './submit-bug-form.component.html',
  styleUrls: ['./submit-bug-form.component.scss']
})
export class SubmitBugFormComponent implements OnInit {
  public form: FormGroup;

  public submissionState: ReplaySubject<string> = new ReplaySubject();
  public submissionStateText: BehaviorSubject<string> = new BehaviorSubject('Submit bug report');

  constructor(
    private readonly fb: FormBuilder,
    private readonly ns: NotificationService,
    private readonly cs: ContactService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      subject: ['Bug report', Validators.required],
      fullName: ['', Validators.required],
      email: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  public sendMessage() {
    this.form.disable();
    this.submissionState.next('pending');
    this.submissionStateText.next('Sending...');

    const value = this.form.getRawValue();

    this.cs
      .postFormMessage({
        from: value.email,
        subject: `${value.subject} ${value.fullName !== '' ? '- from ' + value.fullName : ''}`,
        text: value.body
      })
      .subscribe({
        next: (res) => {
          this.submissionState.next('complete');
        },
        error: (err) => {
          this.submissionState.next('error');
          this.submissionStateText.next('Submit bug report');
          this.form.enable();
        }
      });
  }
}
