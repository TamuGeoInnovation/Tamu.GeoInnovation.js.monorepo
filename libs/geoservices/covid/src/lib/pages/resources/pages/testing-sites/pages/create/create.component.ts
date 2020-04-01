import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';

import { County } from '@tamu-gisc/covid/common/entities';
import {
  StatesService,
  RestrictionsService,
  ClassificationsService,
  TestingSitesService,
  SiteOwnersService,
  SiteServicesService,
  SiteStatusesService
} from '@tamu-gisc/geoservices/data-access';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { Router, ActivatedRoute } from '@angular/router';

const storageOptions = { primaryKey: 'tamu-covid-vga' };

@Component({
  selector: 'tamu-gisc-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
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
    private localStore: LocalStoreService,
    private router: Router,
    private route: ActivatedRoute,
    private st: StatesService,
    private rt: RestrictionsService,
    private cl: ClassificationsService,
    private ts: TestingSitesService,
    private siteOwner: SiteOwnersService,
    private siteService: SiteServicesService,
    private siteStatus: SiteStatusesService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      email: this.localStore.getStorageObjectKeyValue({ ...storageOptions, subKey: 'email' }),
      url: [''],
      address1: [''],
      address2: [''],
      county: [{ value: undefined, disabled: true }],
      city: [''],
      state: [{ value: undefined, disabled: true }],
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
      driveThroughCapacity: [0],
      siteOwnership: [[]],
      siteServices: [[]],
      siteStatus: [[]]
    });

    this.restrictions = this.rt.getRestrictions();

    this.classifications = this.cl.getClassifications();

    this.owners = this.siteOwner.getSiteOwners();

    this.services = this.siteService.getSiteServices();

    this.statuses = this.siteStatus.getSiteStatuses();

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

  public submitForm() {
    const value = this.form.getRawValue();

    this.formState.submitting = true;
    this.form.disable();

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
      })
      .subscribe((res) => {
        console.log(res);
        this.formState.submitting = false;
        this.formState.submitted = true;

        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
