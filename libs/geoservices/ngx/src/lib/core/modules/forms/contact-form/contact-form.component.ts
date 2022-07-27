import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  public form: FormGroup;

  constructor(private readonly fb: FormBuilder, private readonly ns: NotificationService) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', Validators.required],
      subject: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  public sendMessage() {
    this.ns.toast({
      id: 'contact-message-sent',
      title: 'Message sent successfully',
      message: 'Your message was received. A member of our team will review it and get back to you as soon as possible.'
    });
  }
}
