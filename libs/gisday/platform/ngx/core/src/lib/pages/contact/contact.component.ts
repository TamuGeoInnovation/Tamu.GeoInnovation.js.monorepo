import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, Observable, map, of, switchMap, tap } from 'rxjs';

import { ContactService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

@Component({
  selector: 'tamu-gisc-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  public form: FormGroup;
  public formStatus: BehaviorSubject<string> = new BehaviorSubject('ready');
  public buttonText: Observable<string>;

  constructor(private titleService: Title, private fb: FormBuilder, private contactService: ContactService) {
    this.titleService.setTitle('Contact | TxGIS Day');
  }

  public ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.email],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });

    this.buttonText = this.formStatus.pipe(
      map((status) => {
        switch (status) {
          case 'sending':
            return 'Sending...';
          case 'sent':
            return 'Sent!';
          case 'error':
            return 'Error!';
          default:
            return 'Send Message';
        }
      })
    );
  }

  public sendEmail() {
    const form = this.form.getRawValue();

    const outbound: Partial<IMailroomEmailOutbound> = {
      from: form.email,
      subject: `${form.lastName}, ${form.firstName} | ${form.subject}`,
      text: form.message
    };

    of(true)
      .pipe(
        tap(() => {
          this.formStatus.next('sending');
        }),
        switchMap(() => {
          return this.contactService.sendEmail(outbound);
        })
      )
      .subscribe({
        next: () => {
          this.formStatus.next('sent');
        },
        error: (err) => {
          console.log(err.message);
          this.formStatus.next('error');
        }
      });
  }
}
