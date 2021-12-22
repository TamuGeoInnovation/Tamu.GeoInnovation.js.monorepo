import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { StrapiService } from '../../data-access/strapi.service';
import { IContactBugSubmission, IStrapiPageResponse } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  providers: [StrapiService]
})
export class ContactComponent implements OnInit, OnDestroy {
  public pageContents: Observable<IStrapiPageResponse>;
  public contactForm: FormGroup;

  constructor(private ss: StrapiService, private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      verifyEmail: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', [Validators.required, Validators.minLength(4)]),
      dateOfEncounter: new FormControl(''),
      timeOfEncounter: new FormControl(''),
      locationOfEncounter: new FormControl(''),
      stateOfEncounter: new FormControl(''),
      associatedWithBite: new FormControl(''),
      behaviour: new FormControl(''),
      file1: new FormControl(''),
      file2: new FormControl('')
    });
  }

  public ngOnInit() {
    const language: string = navigator.language.substr(0, 2);

    this.pageContents = this.ss.getPage('contact', language).pipe(shareReplay(1));
  }

  public ngOnDestroy() {}

  public validate() {
    const contact: any = {
      // ...this.contactForm.value,
      recipientEmail: this.contactForm.controls.email.value,
      subjectLine: 'Kissing bug submission',
      emailBodyText: this.contactForm.controls.message.value
    }
    // console.log("Email", contact);
    this.ss.sendEmail(contact).subscribe((result) => {
      console.log(result);
    })
  }
}
