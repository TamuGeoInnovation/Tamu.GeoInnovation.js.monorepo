import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ContactService } from '@tamu-gisc/geoservices/data-access';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { TurnstileChallengeComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { NgClass, AsyncPipe } from '@angular/common';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TextboxComponent,
    TurnstileChallengeComponent,
    NgClass,
    ButtonComponent,
    AsyncPipe
  ]
})
export class ContactFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly ns = inject(NotificationService);
  private readonly cs = inject(ContactService);
  private readonly route = inject(ActivatedRoute);

  public form: UntypedFormGroup;

  public submissionState: ReplaySubject<string> = new ReplaySubject();
  public submissionStateText: BehaviorSubject<string> = new BehaviorSubject('Send message');

  public ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', Validators.required],
      subject: ['', Validators.required],
      body: ['', Validators.required],
      turnstile_token: [null, Validators.required]
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
        text: `${value.body}`,
        token: value.turnstile_token
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
