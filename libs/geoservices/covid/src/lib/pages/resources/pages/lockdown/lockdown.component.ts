import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { Classification, County } from '@tamu-gisc/covid/common/entities';
import { ClassificationsService, StatesService, LockdownsService } from '@tamu-gisc/geoservices/data-access';

const storageOptions = { primaryKey: 'tamu-covid-vga' };

@Component({
  selector: 'tamu-gisc-lockdown',
  templateUrl: './lockdown.component.html',
  styleUrls: ['./lockdown.component.scss']
})
export class LockdownComponent implements OnInit {
  public form: FormGroup;
  public classifications: Observable<Array<Classification>>;
  public lockdownState: Observable<boolean>;

  public lockdownOptions = [
    {
      value: 'true',
      label: 'Yes'
    },
    {
      value: 'false',
      label: 'No'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private localStore: LocalStoreService,
    private cl: ClassificationsService,
    private st: StatesService,
    private ls: LockdownsService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      isLockdown: [[], Validators.required],
      startDate: [new Date(Date.now())],
      endDate: [new Date(Date.now())],
      notes: [''],
      protocol: [''],
      url: [''],
      classification: [''],
      healthDepartmentUrl: [''],
      county: [undefined, Validators.required],
      state: [undefined, Validators.required],
      email: [this.localStore.getStorageObjectKeyValue({ ...storageOptions, subKey: 'email' }), Validators.required]
    });

    // Classifications used for url sources
    this.classifications = this.cl.getClassifications();

    // Since I don't have a dedicated radio or radio group component, need to control the selection logic by mapping an array to a boolean
    this.lockdownState = this.form.controls.isLockdown.valueChanges.pipe(
      switchMap((value) => {
        if (value.length > 1 || value.length === 0) {
          return of(undefined);
        } else if (value[0] === 'false') {
          return of(false);
        } else if (value[0] === 'true') {
          return of(true);
        }
      })
    );

    // Set the county and state location fields for the form
    const localCounty = this.localStore.getStorageObjectKeyValue({ ...storageOptions, subKey: 'county' }) as Partial<County>;

    if (localCounty) {
      this.st.getStateByFips(localCounty.stateFips).subscribe((state) => {
        this.form.patchValue({
          county: localCounty.name,
          state: state.name
        });
      });
    }
  }

  public submitLockdown() {
    const value = this.form.getRawValue();

    return this.ls
      .submitLockdown({
        isLockdown: value.isLockdown[0] === 'true' ? true : false,
        startDate: value.isLockdown[0] === 'true' ? value.startDate : undefined,
        endDate: value.isLockdown[0] === 'true' ? value.endDate : undefined,
        notes: value.notes,
        protocol: value.protocol,
        url: value.url,
        classification: value.classification.length >= 1 ? value.classification[0] : undefined,
        healthDepartmentUrl: value.healthDepartmentUrl,
        county: value.county,
        state: value.state,
        email: value.email
      })
      .subscribe((res) => {
        console.log('Lockdown submit response:', res);
      });
  }
}
