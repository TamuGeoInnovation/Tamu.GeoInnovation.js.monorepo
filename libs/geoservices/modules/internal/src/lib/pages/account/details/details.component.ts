import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { AccountDetailsService, IAccountDetails } from '@tamu-gisc/geoservices/modules/data-access';

@Component({
  selector: 'tamu-gisc-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  public data: Observable<IAccountDetails>;

  public form: FormGroup;

  constructor(private service: AccountDetailsService, private fb: FormBuilder) {}

  public ngOnInit() {
    this.form = this.fb.group({
      Added: [''],
      FirstName: [''],
      LastName: [''],
      Email: [''],
      BillingEmail: [''],
      Phone: [''],
      Organization: [''],
      Department: [''],
      Position: [''],
      Website: [''],
      Address1: [''],
      Address2: [''],
      City: [''],
      State: [''],
      Zip: [''],
      Country: ['']
    });

    this.service.details.subscribe((details) => {
      this.form.patchValue(details);

      this.form.valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
        this.service.updateDetails(this.form.getRawValue());
      });
    });
  }
}
