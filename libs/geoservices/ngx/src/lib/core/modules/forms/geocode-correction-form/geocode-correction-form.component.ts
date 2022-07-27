import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-geocode-correction-form',
  templateUrl: './geocode-correction-form.component.html',
  styleUrls: ['./geocode-correction-form.component.scss']
})
export class GeocodeCorrectionFormComponent implements OnInit {
  public form: FormGroup;

  public states = STATES_TITLECASE;

  constructor(private readonly fb: FormBuilder, private readonly ns: NotificationService) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
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

    this.ns.toast({
      id: 'correction-message-sent',
      title: 'Correction sent successfully',
      message: 'Thank you for your feedback!'
    });
  }
}
