import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  public form: FormGroup;

  constructor(private titleService: Title, private fb: FormBuilder) {
    this.titleService.setTitle('Contact | TxGIS Day 2020');
  }

  public ngOnInit(): void {
    this.form = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      contactType: [''],
      contactMessage: ['']
    });
  }

  public sendEmail() {
    console.log(this.form.getRawValue());
  }
}
