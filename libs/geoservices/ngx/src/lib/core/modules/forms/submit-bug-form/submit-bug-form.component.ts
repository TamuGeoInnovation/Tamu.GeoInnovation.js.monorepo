import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ContactService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-submit-bug-form',
  templateUrl: './submit-bug-form.component.html',
  styleUrls: ['./submit-bug-form.component.scss']
})
export class SubmitBugFormComponent implements OnInit {
  public form: FormGroup;

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

    const value = this.form.getRawValue();

    this.cs
      .postFormMessage({
        from: value.email,
        subject: `${value.subject} ${value.fullName !== '' ? '- from ' + value.fullName : ''}`,
        body: value.body
      })
      .subscribe({
        complete: () => {
          this.ns.toast({
            id: 'bug-report-message-sent',
            title: 'Bug report sent successfully',
            message: 'Thank you for your feedback!'
          });
        },
        error: (err) => {
          this.ns.toast({
            id: 'bug-report-message-fail',
            title: 'Message failed to send',
            message: 'Your correction message could not be sent. Please try again later.'
          });
        }
      });
  }
}
