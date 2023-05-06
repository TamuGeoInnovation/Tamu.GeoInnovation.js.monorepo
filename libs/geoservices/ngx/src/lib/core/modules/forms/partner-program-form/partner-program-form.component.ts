import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { ContactService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-partner-program-form',
  templateUrl: './partner-program-form.component.html',
  styleUrls: ['./partner-program-form.component.scss']
})
export class PartnerProgramFormComponent implements OnInit {
  public states = STATES_TITLECASE;
  public form: FormGroup;

  public submissionState: ReplaySubject<string> = new ReplaySubject();
  public submissionStateText: BehaviorSubject<string> = new BehaviorSubject('Submit application');

  public termsOfUseOptions = [
    {
      value: true,
      label: 'Yes'
    },
    {
      value: false,
      label: 'No'
    }
  ];

  public partnerTypes = [
    {
      value: 'Commercial',
      label: 'Commercial'
    },
    {
      value: 'Non-Commercial',
      label: 'Non-Commercial'
    }
  ];

  constructor(private readonly fb: FormBuilder, private readonly cs: ContactService) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, Validators.required],
      phoneNumber: [null, Validators.required],
      organization: [null],
      department: [null],
      position: [null],
      website: [null],
      mailingStreetAddress: [null, Validators.required],
      mailingStreetAddressTwo: [null],
      mailingCity: [null, Validators.required],
      mailingState: [null, Validators.required],
      mailingZip: [null, Validators.required],
      partnerType: [null, Validators.required],
      partnerWebsite: [null, Validators.required],
      partnerOrgDescription: [null, Validators.required],
      partnerUsageDescription: [null, Validators.required],
      partnerTermsOfUseAgree: [false, Validators.requiredTrue]
    });
  }

  public sendMessage() {
    this.form.disable();
    this.submissionState.next('pending');
    this.submissionStateText.next('Submitting...');

    const value = this.form.getRawValue();

    const message = `
    Contact
    -------

    First name: ${value.firstName}
    Last name: ${value.lastName}
    Email: ${value.email}
    Phone number: ${value.phoneNumber}
    Personal organization: ${value.organization}
    Personal department: ${value.department}
    Personal position: ${value.position}
    Personal website: ${value.website}

    Mailing
    -------

    Mailing street address: ${value.mailingStreetAddress}
    Mailing street address 2: ${value.mailingStreetAddressTwo}
    Mailing city: ${value.mailingCity}
    Mailing state: ${value.mailingState}
    Mailing zip: ${value.mailingZip}

    Partnership Information
    -----------------------
    
    Partner type: ${value.partnerType}
    Partner website: ${value.partnerWebsite}
    Partner organization description: ${value.partnerOrgDescription}
    Partner usage description: ${value.partnerUsageDescription}
    `;

    this.cs
      .postFormMessage({
        from: value.email,
        subject: 'Partner Application',
        text: message
      })
      .subscribe({
        next: (res) => {
          this.submissionState.next('complete');
        },
        error: (err) => {
          this.submissionState.next('error');
          this.submissionStateText.next('Submit application');
          this.form.enable();
        }
      });
  }
}
