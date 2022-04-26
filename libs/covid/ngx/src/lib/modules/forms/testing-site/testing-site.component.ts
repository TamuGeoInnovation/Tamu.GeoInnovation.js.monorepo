import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, pluck, filter, withLatestFrom } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import { County, User, TestingSite, FieldCategory, EntityValue } from '@tamu-gisc/covid/common/entities';

import { IdentityService } from '../../../services/identity.service';
import { StatesService } from '../../../data-access/states/states.service';
import { RestrictionsService } from '../../../data-access/restrictions/restrictions.service';
import { WebsiteTypesService } from '../../../data-access/website-types/website-types.service';
import { TestingSitesService } from '../../../data-access/testing-sites/testing-sites.service';
import { SiteOwnersService } from '../../../data-access/site-owners/site-owners.service';
import { SiteServicesService } from '../../../data-access/site-services/site-services.service';
import { SiteStatusesService } from '../../../data-access/site-statuses/site-statuses.service';
import { PhoneNumberTypesService } from '../../../data-access/phone-number-types/phone-number-types.service';

@Component({
  selector: 'tamu-gisc-testing-site',
  templateUrl: './testing-site.component.html',
  styleUrls: ['./testing-site.component.scss']
})
export class TestingSiteComponent implements OnInit, OnChanges {
  @Input()
  public readonly: boolean;

  @Input()
  public formData: Partial<TestingSite>;

  public form: FormGroup;

  public states: Observable<object>;
  public counties: Observable<object>;

  public siteRestrictionTypes: Observable<Partial<FieldCategory>>;
  public siteOwnerTypes: Observable<Partial<FieldCategory>>;
  public siteServiceTypes: Observable<Partial<FieldCategory>>;
  public operationalStatusTypes: Observable<Partial<FieldCategory>>;
  public websitesTypes: Observable<Partial<FieldCategory>>;
  public phoneTypes: Observable<Partial<FieldCategory>>;

  public undisclosedState: Observable<boolean>;

  public localCounty: Observable<DeepPartial<County>>;
  public localEmail: Observable<Partial<User['email']>>;

  public formState = {
    submitting: false,
    submitted: false,
    error: false
  };

  public availabilityOptions = [
    {
      value: true,
      label: 'Yes'
    },
    {
      value: false,
      label: 'No'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private st: StatesService,
    private rt: RestrictionsService,
    private cl: WebsiteTypesService,
    private ph: PhoneNumberTypesService,
    private ts: TestingSitesService,
    private siteOwner: SiteOwnersService,
    private siteService: SiteServicesService,
    private siteStatus: SiteStatusesService,
    private is: IdentityService
  ) {}

  public ngOnInit() {
    this.localCounty = this.is.identity.pipe(
      pluck('claim', 'county'),
      filter((county) => {
        return county !== undefined && county.countyFips !== undefined;
      })
    );
    this.localEmail = this.is.identity.pipe(
      pluck('user', 'email'),
      filter((email) => {
        return email !== undefined;
      })
    );

    this.form = this.fb.group({
      guid: [undefined],
      claim: this.fb.group({
        user: this.fb.group({
          email: [
            // TODO:
            undefined,
            Validators.required
          ]
        }),
        county: this.fb.group({
          countyFips: [undefined, Validators.required]
        })
      }),
      location: this.fb.group({
        address1: [''],
        address2: [''],
        city: [''],
        zip: [''],
        county: [''],
        state: [''],
        country: ['']
      }),
      info: this.fb.group({
        undisclosed: [],
        sitesAvailable: [undefined],
        locationName: [''],
        locationPhoneNumber: [''],
        hoursOfOperation: [''],
        capacity: [undefined],
        driveThrough: [''],
        driveThroughCapacity: [undefined],
        notes: [''],
        status: [undefined],
        owners: [[]],
        services: [[]],
        restrictions: [[]],
        websites: this.fb.array([]),
        phoneNumbers: this.fb.array([])
      })
    });

    this.siteRestrictionTypes = this.rt.getRestrictions();

    this.siteOwnerTypes = this.siteOwner.getSiteOwners();

    this.siteServiceTypes = this.siteService.getSiteServices();

    this.operationalStatusTypes = this.siteStatus.getSiteStatuses();

    this.websitesTypes = this.cl.getWebsiteTypes();

    this.phoneTypes = this.ph.getPhoneNumberTypes();

    this.localCounty
      .pipe(
        switchMap((county) => {
          return this.st.getStateByFips(county.stateFips.stateFips);
        }),
        withLatestFrom(this.localCounty)
      )
      .subscribe(([state, county]) => {
        this.form.patchValue({
          claim: {
            county: {
              countyFips: county.countyFips
            }
          },
          location: {
            county: county.name,
            state: state.name
          }
        });
      });

    this.localEmail.subscribe((email) => {
      this.form.patchValue({
        claim: {
          user: {
            email: email
          }
        }
      });
    });

    this.undisclosedState = this.form.get(['info', 'undisclosed']).valueChanges;

    if (this.readonly) {
      this.form.disable();
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.formData && changes.formData.currentValue !== null) {
      const patch = JSON.parse(JSON.stringify(this.formData));

      patch.info.undisclosed = !patch.info.undisclosed;
      patch.info.status = patch.info.status[0] && patch.info.status ? patch.info.status : undefined;
      patch.info.owners = patch.info.owners.length > 0 ? patch.info.owners.split(',') : [];
      patch.info.restrictions = patch.info.restrictions.length > 0 ? patch.info.restrictions.split(',') : [];
      patch.info.services = patch.info.services.length > 0 ? patch.info.services.split(',') : [];

      this.form.patchValue(patch);

      if (patch.info.phoneNumbers.length > 0) {
        const phc = this.form.get(['info', 'phoneNumbers']) as FormArray;
        patch.info.phoneNumbers.forEach((n) => phc.push(this.createPhoneNumberGroup(n)));
      }

      if (patch.info.websites.length > 0) {
        const wc = this.form.get(['info', 'websites']) as FormArray;
        patch.info.websites.forEach((w) => wc.push(this.createWebsiteGroup(w)));
      }
    }
  }

  public createPhoneNumberGroup(number?: Partial<EntityValue>): FormGroup {
    return this.fb.group(this.createPhoneNumber(number));
  }

  public createWebsiteGroup(website?: Partial<EntityValue>): FormGroup {
    return this.fb.group(this.createWebsite(website));
  }

  public createPhoneNumber(number?: Partial<EntityValue>) {
    return {
      value: this.fb.group({
        value: number && number.value && number.value.value,
        type: number && number.value && number.value.type.guid
      })
    };
  }

  public createWebsite(website?: Partial<EntityValue>) {
    return {
      value: this.fb.group({
        value: website && website.value && website.value.value,
        type: website && website.value && website.value.type.guid
      })
    };
  }

  /**
   * Push a phone number form group to the form array
   */
  public addPhoneNumber() {
    (this.form.get(['info', 'phoneNumbers']) as FormArray).push(this.createPhoneNumberGroup());
  }

  public addWebsite() {
    (this.form.get(['info', 'websites']) as FormArray).push(this.createWebsiteGroup());
  }

  public removeFormArrayControl(collection: string, index: number) {
    (this.form.get(['info', collection]) as FormArray).removeAt(index);
  }

  public submitForm() {
    const value = this.form.getRawValue();

    // Undisclosed wording, is a double negative.
    value.info.undisclosed = !value.info.undisclosed;

    value.info.owners = value.info.owners.join(',');
    value.info.services = value.info.services.join(',');
    value.info.restrictions = value.info.restrictions.join(',');
    value.info.driveThroughCapacity = value.info.driveThrough ? value.info.driveThroughCapacity : null;

    this.formState.submitting = true;
    this.form.disable();

    this.ts.submitSite(value).subscribe((res) => {
      console.log(res);
      this.formState.submitting = false;
      this.formState.submitted = true;
    });

    console.log(value);
  }
}
