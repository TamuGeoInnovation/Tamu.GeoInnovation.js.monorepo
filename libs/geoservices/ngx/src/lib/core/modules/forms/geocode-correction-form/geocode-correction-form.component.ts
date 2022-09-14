import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ContactService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-geocode-correction-form',
  templateUrl: './geocode-correction-form.component.html',
  styleUrls: ['./geocode-correction-form.component.scss']
})
export class GeocodeCorrectionFormComponent implements OnInit {
  public form: FormGroup;

  public states = STATES_TITLECASE;

  public submissionState: ReplaySubject<string> = new ReplaySubject();
  public submissionStateText: BehaviorSubject<string> = new BehaviorSubject('Submit correction');

  constructor(
    private readonly fb: FormBuilder,
    private readonly ns: NotificationService,
    private readonly cs: ContactService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      subject: ['Address Correction', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: [null, Validators.required],
      zip: ['', Validators.required],
      correctedLat: ['', Validators.required],
      correctedLon: ['', Validators.required]
    });
  }

  public sendMessage() {
    this.form.disable();
    this.submissionState.next('pending');
    this.submissionStateText.next('Sending...');

    const value = this.form.getRawValue();

    this.cs
      .postFormMessage({
        from: value.email,
        subject: value.subject,
        body: `
          From: ${value.email},
          Address: ${value.address}
          City: ${value.city}
          State: ${value.state}
          Zip: ${value.zip}
          Corrected latitude: ${value.correctedLat}
          Corrected longitude: ${value.correctedLon}
        `
      })
      .subscribe({
        next: (res) => {
          this.submissionState.next('complete');
        },
        error: (err) => {
          this.submissionState.next('error');
          this.submissionStateText.next('Submit correction');
          this.form.enable();
        }
      });
  }
}
