import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { AccountDetailsService, IAccountDetails } from '@tamu-gisc/geoservices/data-access';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ReactiveFormsModule, TextboxComponent]
})
export class DetailsComponent implements OnInit {
  public data: Observable<IAccountDetails>;

  public form: UntypedFormGroup;

  constructor(
    private service: AccountDetailsService,
    private fb: UntypedFormBuilder
  ) {}

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

    this.service.getDetails().subscribe((details) => {
      this.form.patchValue(details);

      this.form.valueChanges.pipe(debounceTime(1000)).subscribe(() => {
        this.service.updateDetails(this.form.getRawValue()).subscribe(() => [console.log('Updated details')]);
      });
    });
  }
}
