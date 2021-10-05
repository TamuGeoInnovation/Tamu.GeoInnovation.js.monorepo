import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse, StrapiSingleTypes } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  providers: [StrapiService]
})
export class ContactComponent implements OnInit, OnDestroy {
  private title = 'Contact | Kissing Bugs and Chagas Disease in the U.S. | Texas A&M';
  public page: StrapiSingleTypes = 'contact';
  public pageContents: Observable<IStrapiPageResponse>;
  public contactForm: FormGroup;

  constructor(private titleService: Title, private ss: StrapiService, private fb: FormBuilder) {
    this.contactForm = this.fb.group(
      {
        firstName: new FormControl('', [Validators.minLength(2)]),
        lastName: new FormControl('', [Validators.minLength(2)]),
        email: new FormControl('', [Validators.required, Validators.email]),
        verifyEmail: new FormControl('', [Validators.email]),
        message: new FormControl(''),
        dateOfEncounter: new FormControl(''),
        timeOfEncounter: new FormControl(''),
        locationOfEncounter: new FormControl(''),
        stateOfEncounter: new FormControl(''),
        associatedWithBite: new FormControl(''),
        behaviour: new FormControl(''),
        file1: new FormControl(''),
        file2: new FormControl(''),
        hiddenInput: new FormControl(false),
        isHuman: new FormControl(false)
      },
      {
        validators: [confirmedEmailValidator, isTrue]
      }
    );
  }

  public ngOnInit() {
    this.titleService.setTitle(this.title);

    const language: string = navigator.language.substr(0, 2);

    this.pageContents = this.ss.getPage('contact', language).pipe(shareReplay(1));
  }

  public ngOnDestroy() {}

  public validate() {
    if (this.contactForm.status === 'VALID') {
      const formData = new FormData();
      const fileControls = [this.contactForm.controls.file1, this.contactForm.controls.file2];

      const controls = Object.keys(this.contactForm.value);
      controls.forEach((controlName) => {
        if (!controlName.includes('file')) {
          formData.append(controlName, this.contactForm.get(controlName).value);
        }
      });

      fileControls.forEach((fileControl, i) => {
        if (fileControl.value && fileControl.value !== '') {
          formData.append(`file${i}`, fileControl.value, fileControl.value.name);
        }
      });

      formData.append('recipientEmail', this.contactForm.controls.email.value);
      formData.append('subjectLine', 'Kissing bug submission');
      formData.append('emailBodyText', this.contactForm.controls.message.value);

      // this.ss.sendEmail(formData).subscribe((result) => {});
    } else {
      console.log(this.contactForm.status);
    }
  }

  public onFileChanged(file: string, event) {
    this.contactForm.get(file).setValue(event.target.files[0]);
  }
}

export const isTrue: ValidatorFn = (control: AbstractControl) => {
  const isHuman = control.get('isHuman');

  return isHuman && isHuman.value ? null : { isRobot: true };
};

export const confirmedEmailValidator: ValidatorFn = (control: AbstractControl) => {
  const email = control.get('email');
  const verifyEmail = control.get('verifyEmail');

  return email && verifyEmail && email.value === verifyEmail.value ? null : { confirmedEmail: true };
};
