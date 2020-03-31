import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import {
  StatesService,
  CountiesService,
  RestrictionsService,
  ClassificationsService,
  TestingSitesService
} from '@tamu-gisc/geoservices/data-access';
import { shareReplay, switchMap, find, filter } from 'rxjs/operators';
import { Observable, from } from 'rxjs';

@Component({
  selector: 'tamu-gisc-testing-sites-advanced',
  templateUrl: './testing-sites-advanced.component.html',
  styleUrls: ['./testing-sites-advanced.component.scss']
})
export class TestingSitesAdvancedComponent implements OnInit {
  public form: FormGroup;

  public states: Observable<object>;
  public counties: Observable<object>;
  public restrictions: Observable<object>;
  public classifications: Observable<object>;

  constructor(
    private fb: FormBuilder,
    private st: StatesService,
    private ct: CountiesService,
    private rt: RestrictionsService,
    private cl: ClassificationsService,
    private ts: TestingSitesService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      email: [''],
      url: [''],
      address1: [''],
      address2: [''],
      county: [undefined],
      city: [''],
      state: [undefined],
      zip: [''],
      notes: [''],
      classification: [[]],
      restrictions: [[]],
      healthDepartmentUrl: [''],
      locationName: [''],
      operationStartTime: [''],
      operationEndTime: [''],
      driveThrough: [false],
      capacity: ['']
    });

    this.states = this.st.getStates().pipe(shareReplay(1));

    this.counties = this.form.controls.state.valueChanges.pipe(
      switchMap((state) => {
        return this.states.pipe(
          switchMap((states: any) => from(states)),
          filter((st: any) => {
            return st.name === state;
          })
        );
      }),
      switchMap((st) => {
        return this.ct.getCountiesForState(st.stateFips);
      }),
      shareReplay(1)
    );

    this.restrictions = this.rt.getRestrictions();

    this.classifications = this.cl.getClassifications();
  }

  public submitForm() {
    const value = this.form.getRawValue();

    this.ts
      .submitSite({
        email: value.email,
        url: value.url,
        address1: value.address1,
        address2: value.address2,
        county: value.county,
        city: value.city,
        state: value.state,
        zip: value.zip,
        notes: value.notes,
        classification: value.classification.length >= 1 ? value.classification[0] : undefined,
        restrictions: value.restrictions.join(','),
        healthDepartmentUrl: value.healthDepartmentUrl,
        locationName: value.locationName,
        operationStartTime: value.operationStartTime,
        operationEndTime: value.operationEndTime,
        driveThrough: value.driveThrough,
        capacity: value.capacity
      })
      .subscribe((res) => {
        console.log(res);
      });
  }
}
