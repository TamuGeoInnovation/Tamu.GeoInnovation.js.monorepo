import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  public form: FormGroup;

  constructor(private titleService: Title, private fb: FormBuilder) {
    this.titleService.setTitle('Contact | TxGIS Day 2022');
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
    // TODO: Link with Mailroom - Aaron H (4/26/22)
    console.log(this.form.getRawValue());
  }
}
