import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoggedInState } from '@tamu-gisc/geoservices/ngx/data-access';

@Component({
  selector: 'tamu-gisc-user-details-form',
  templateUrl: './user-details-form.component.html',
  styleUrls: ['./user-details-form.component.scss']
})
export class UserDetailsFormComponent implements OnInit {
  @Input()
  public contactInfo: LoggedInState['data'];

  public form: FormGroup;

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      FirstName: [{ value: '', disabled: true }],
      LastName: [{ value: '', disabled: true }],
      Email: [{ value: '', disabled: true }],
      Phone: [{ value: '', disabled: true }]
    });

    if (this.contactInfo) {
      this.form.patchValue(this.contactInfo);
    }
  }
}
