import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { ContactService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

@Component({
  selector: 'tamu-gisc-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  public form: FormGroup;

  constructor(private titleService: Title, private fb: FormBuilder, private contactService: ContactService) {
    this.titleService.setTitle('Contact | TxGIS Day');
  }

  public ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.email],
      contactType: ['', Validators.required],
      contactMessage: ['', Validators.required]
    });
  }

  public sendEmail() {
    const outbound: IMailroomEmailOutbound = {
      from: this.form.controls.email.value,
      subject: `GIS Day Contact: ${this.form.controls.contactType.value}`,
      text: this.form.controls.contactMessage.value,
      to: 'aplecore@gmail.com'
    };

    this.contactService.sendEmail(outbound).subscribe((result) => {
      console.log(result);
    });
  }
}
