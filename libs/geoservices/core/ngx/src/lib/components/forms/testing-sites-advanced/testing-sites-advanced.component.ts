import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import {
  StatesService,
  CountiesService,
  RestrictionsService,
  ClassificationsService,
  TestingSitesService,
  LockdownsService,
  SiteOwnersService,
  SiteServicesService,
  SiteStatusesService
} from '@tamu-gisc/geoservices/data-access';
import { Observable, from, of, concat } from 'rxjs';
import { shareReplay, switchMap, filter, toArray } from 'rxjs/operators';

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
  public owners: Observable<object>;
  public services: Observable<object>;
  public statuses: Observable<object>;

  public formState = {
    submitting: false,
    submitted: false,
    error: false
  };

  constructor(
    private fb: FormBuilder,
    private st: StatesService,
    private ct: CountiesService,
    private rt: RestrictionsService,
    private cl: ClassificationsService,
    private ts: TestingSitesService,
    private ls: LockdownsService,
    private siteOwner: SiteOwnersService,
    private siteService: SiteServicesService,
    private siteStatus: SiteStatusesService
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
      locationPhoneNumber: [''],
      hoursOfOperation: [''],
      capacity: [undefined],
      driveThrough: [false],
      driveThroughCapacity: [''],
      isLockdown: [false],
      lockdownProtocol: [''],
      lockdownStart: [Date.now()],
      lockdownEnd: [Date.now()],
      lockdownUrl: [''],
      lockdownUrlClassification: [[]],
      siteOwnership: [[]],
      siteServices: [[]],
      siteStatus: [[]]
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

    this.owners = this.siteOwner.getSiteOwners();

    this.services = this.siteService.getSiteServices();

    this.statuses = this.siteStatus.getSiteStatuses();
  }

  public submitForm() {
    const value = this.form.getRawValue();

    this.formState.submitting = true;
    this.form.disable();

    concat(
      this.ts.submitSite({
        email: value.email,
        url: value.url,
        address1: value.address1,
        address2: value.address2,
        county: value.county,
        city: value.city,
        state: value.state,
        zip: value.zip,
        notes: value.notes,
        healthDepartmentUrl: value.healthDepartmentUrl,
        locationName: value.locationName,
        locationPhoneNumber: value.locationPhoneNumber,
        hoursOfOperation: value.hoursOfOperation,
        driveThrough: value.driveThrough,
        driveThroughCapacity: value.driveThroughCapacity,
        capacity: value.capacity,
        classification: value.classification.length >= 1 ? value.classification[0] : undefined,
        restrictions: value.restrictions.join(','),
        owners: value.siteOwnership.join(','),
        services: value.siteServices.join(','),
        status: value.siteStatus.length >= 1 ? value.siteStatus[0] : undefined
      }),
      of(value.isLockdown).pipe(
        switchMap((should) => {
          if (should) {
            return this.ls.submitLockdown({
              email: value.email,
              url: value.lockdownUrl,
              address1: value.address1,
              address2: value.address2,
              county: value.county,
              city: value.city,
              state: value.state,
              zip: value.zip,
              protocol: value.lockdownProtocol,
              classification: value.lockdownUrlClassification.length >= 1 ? value.lockdownUrlClassification[0] : undefined,
              healthDepartmentUrl: value.healthDepartmentUrl,
              startDate: value.lockdownStart,
              endDate: value.lockdownEnd
            });
          } else {
            return of(false);
          }
        })
      )
    )
      .pipe(toArray())
      .subscribe((res) => {
        console.log(res);
        this.formState.submitting = false;
        this.formState.submitted = true;
      });
  }
}
