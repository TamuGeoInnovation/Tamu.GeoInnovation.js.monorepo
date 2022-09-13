import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ContactService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  public form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly ns: NotificationService,
    private readonly cs: ContactService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', Validators.required],
      subject: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  public sendMessage() {
    const value = this.form.getRawValue();

    this.cs
      .postFormMessage({
        from: value.email,
        subject: `${value.subject} - ${value.fullName}`,
        body: `${value.body}`
      })
      .subscribe({
        complete: () => {
          this.ns.toast({
            id: 'contact-message-sent',
            title: 'Message sent successfully',
            message:
              'Your message was received. A member of our team will review it and get back to you as soon as possible.'
          });
        },
        error: (err) => {
          this.ns.toast({
            id: 'contact-message-fail',
            title: 'Message failed to send',
            message: 'Your message could not be sent. Please try again later. '
          });
        }
      });
  }
}
