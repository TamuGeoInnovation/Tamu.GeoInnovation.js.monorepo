import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ContactService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  public form: FormGroup;

  public submissionState: ReplaySubject<string> = new ReplaySubject();
  public submissionStateText: BehaviorSubject<string> = new BehaviorSubject('Send message');

  constructor(
    private readonly fb: FormBuilder,
    private readonly ns: NotificationService,
    private readonly cs: ContactService,
    private readonly route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', Validators.required],
      subject: ['', Validators.required],
      body: ['', Validators.required]
    });

    if (this.route.snapshot.queryParams.subject !== undefined) {
      this.form.patchValue({ subject: this.route.snapshot.queryParams.subject });
    }
  }

  public sendMessage() {
    this.form.disable();
    this.submissionState.next('pending');
    this.submissionStateText.next('Sending...');

    const value = this.form.getRawValue();

    this.cs
      .postFormMessage({
        from: value.email,
        subject: `Contact - ${value.subject} ${value.fullName !== '' ? '- from ' + value.fullName : ''}`,
        text: `${value.body}`
      })
      .subscribe({
        next: () => {
          this.submissionState.next('complete');
        },
        error: () => {
          this.submissionState.next('error');
          this.submissionStateText.next('Send message');
          this.form.enable();
        }
      });
  }
}
