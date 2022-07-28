import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { StrapiService } from '../../data-access/strapi.service';
import { IStrapiPageResponse, StrapiSingleTypes } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  providers: [StrapiService]
})
export class ContactComponent implements OnInit {
  private title = 'Contact | Kissing Bugs and Chagas Disease in the U.S. | Texas A&M';
  public page: StrapiSingleTypes = 'contact';
  public pageContents: Observable<IStrapiPageResponse>;
  public contactForm: FormGroup;
  public today: Date = new Date(Date.now());

  constructor(
    private titleService: Title,
    private ss: StrapiService,
    private fb: FormBuilder,
    private environment: EnvironmentService
  ) {
    this.contactForm = this.fb.group(
      {
        application: new FormControl('KissingBug'),
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

    this.pageContents = this.ss.getPage(this.page, language).pipe(shareReplay(1));
  }

  public validate() {
    if (
      this.contactForm.status === 'VALID' &&
      (this.contactForm.controls.hiddenInput.value === false || this.contactForm.controls.hiddenInput.value === null)
    ) {
      const formData = new FormData();
      const fileControls = [this.contactForm.controls.file1, this.contactForm.controls.file2];

      // Construct our IMailroomEmailOutbound
      const allKeys = Object.keys(this.contactForm.value);

      // Don't include any file controls and values for the HTML portion
      const keys = allKeys.filter((key) => this.contactForm.controls[key].value !== '' && !key.includes('file'));

      const htmlValue = keys
        .map((key, index) => {
          const value = this.contactForm.controls[key].value;

          if (index === 0) {
            return `<ul><li><b>${key}</b>: ${value}</li>`;
          } else if (index === keys.length - 1) {
            return `<li><b>${key}</b>: ${value}</li></ul>`;
          } else {
            return `<li><b>${key}</b>: ${value}</li>`;
          }
        })
        .join('');

      const outboundMail: IMailroomEmailOutbound = {
        to: this.contactForm.get('email').value,
        from: this.environment.value('email_from_account'),
        subject: 'Kissing Bugs contact page email',
        text: '',
        html: htmlValue
      };

      // Convert IMailroomEmailOutbound to FormData so we can also handle attachments
      const mailroomOutboundKeys = Object.keys(outboundMail);
      mailroomOutboundKeys.forEach((key) => {
        formData.append(key, outboundMail[key]);
      });

      // Don't forget any files
      fileControls.forEach((fileControl, i) => {
        if (fileControl.value && fileControl.value !== '') {
          formData.append(`file${i}`, fileControl.value, fileControl.value.name);
        }
      });

      this.ss.sendEmailAsMultipartFormdata(formData).subscribe(() => {
        this.contactForm.reset();
      });
    } else {
      console.log(this.contactForm.status, this.contactForm.controls.hiddenInput.value);
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
