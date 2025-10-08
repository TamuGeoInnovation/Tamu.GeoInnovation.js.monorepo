import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ContactService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-submit-bug-form',
  templateUrl: './submit-bug-form.component.html',
  styleUrls: ['./submit-bug-form.component.scss']
})
export class SubmitBugFormComponent implements OnInit {
  public form: UntypedFormGroup;

  public submissionState: ReplaySubject<string> = new ReplaySubject();
  public submissionStateText: BehaviorSubject<string> = new BehaviorSubject('Submit bug report');

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly ns: NotificationService,
    private readonly cs: ContactService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      subject: ['Bug report', Validators.required],
      fullName: ['', Validators.required],
      email: ['', Validators.required],
      body: ['', Validators.required],
      turnstile_token: [null, Validators.required]
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
        text: value.body,
        token: value.turnstile_token
      })
      .subscribe({
        next: () => {
          this.submissionState.next('complete');
        },
        error: () => {
          this.submissionState.next('error');
          this.submissionStateText.next('Submit bug report');
          this.form.enable();
        }
      });
  }
}
