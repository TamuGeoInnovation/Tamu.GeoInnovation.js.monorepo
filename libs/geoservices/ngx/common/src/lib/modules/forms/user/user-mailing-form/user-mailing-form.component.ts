import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { LoggedInState } from '@tamu-gisc/geoservices/ngx/data-access';

@Component({
  selector: 'tamu-gisc-user-mailing-form',
  templateUrl: './user-mailing-form.component.html',
  styleUrls: ['./user-mailing-form.component.scss']
})
export class UserMailingFormComponent implements OnInit {
  @Input()
  public addressInfo: LoggedInState['data'];

  public form: FormGroup;
  public states = STATES_TITLECASE;

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      Address1: [{ value: '', disabled: true }],
      Address2: [{ value: '', disabled: true }],
      City: [{ value: '', disabled: true }],
      State: [{ value: null, disabled: true }],
      Zip: [{ value: '', disabled: true }]
    });

    if (this.addressInfo) {
      this.form.patchValue(this.addressInfo);
    }
  }
}
