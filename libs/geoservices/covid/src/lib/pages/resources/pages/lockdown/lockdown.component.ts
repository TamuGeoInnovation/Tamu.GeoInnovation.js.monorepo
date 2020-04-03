import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { WebsiteType, County, User, PhoneNumber, PhoneNumberType, Website } from '@tamu-gisc/covid/common/entities';
import {
  ClassificationsService,
  StatesService,
  LockdownsService,
  PhoneNumberTypesService
} from '@tamu-gisc/geoservices/data-access';

const storageOptions = { primaryKey: 'tamu-covid-vgi' };

@Component({
  selector: 'tamu-gisc-lockdown',
  templateUrl: './lockdown.component.html',
  styleUrls: ['./lockdown.component.scss']
})
export class LockdownComponent implements OnInit {
  public form: FormGroup;

  public websitesTypes: Observable<Array<Partial<WebsiteType>>>;
  public phoneTypes: Observable<Array<Partial<PhoneNumberType>>>;

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
    private ls: LockdownsService,
    private ph: PhoneNumberTypesService
  ) {}

  public ngOnInit() {
    const localEmail = (this.localStore.getStorageObjectKeyValue({ ...storageOptions, subKey: 'identity' }) as Partial<User>)
      .email;

    this.form = this.fb.group({
      claim: this.fb.group({
        user: [localEmail, Validators.required],
        county: ['']
      }),
      location: this.fb.group({
        address1: [''],
        address2: [''],
        city: [''],
        zip: [''],
        county: ['', Validators.required],
        state: ['', Validators.required]
      }),
      info: this.fb.group({
        isLockdown: [[]],
        startDate: [new Date().toISOString().split('T')[0]],
        endDate: [new Date().toISOString().split('T')[0]],
        protocol: [''],
        notes: [''],
        phoneNumbers: this.fb.array([]),
        websites: this.fb.array([])
      })
    });

    this.websitesTypes = this.cl.getClassifications();
    this.phoneTypes = this.ph.getPhoneNumberTypes();

    // Since I don't have a dedicated radio or radio group component, need to control the selection logic by mapping an array to a boolean
    this.lockdownState = (this.form.controls.info as FormGroup).controls.isLockdown.valueChanges.pipe(
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
          claim: {
            county: localCounty.countyFips
          },
          location: {
            county: localCounty.name,
            state: state.name
          }
        });
      });
    }

    this.ls.getActiveLockdownForEmail(localEmail).subscribe((res) => {
      const merged = {
        claim: {
          user: localEmail,
          county: res.claim.county.countyFips
        },
        location: {
          address1: res.location.address1,
          address2: res.location.address2,
          city: res.location.city,
          zip: res.location.zip,
          county: res.location.county,
          state: res.location.state
        },
        info: {
          isLockdown: [res.info.isLockdown.toString()],
          startDate: ((res.info.startDate as unknown) as string).split('T')[0],
          endDate: ((res.info.endDate as unknown) as string).split('T')[0],
          protocol: res.info.protocol,
          notes: res.info.notes
        }
      };

      this.form.patchValue(merged);

      const phc = this.form.get(['info', 'phoneNumbers']) as FormArray;
      const wc = this.form.get(['info', 'websites']) as FormArray;

      res.info.phoneNumbers.forEach((n) => phc.push(this.createPhoneNumberGroup(n)));
      res.info.websites.forEach((w) => wc.push(this.createWebsiteGroup(w)));
    });
  }

  public createPhoneNumberGroup(number?: Partial<PhoneNumber>): FormGroup {
    return this.fb.group(this.createPhoneNumber(number));
  }

  public createWebsiteGroup(website?: Partial<Website>): FormGroup {
    return this.fb.group(this.createWebsite(website));
  }

  public createPhoneNumber(number?: Partial<PhoneNumber>) {
    return {
      number: (number && number.number) || '',
      type: (number && number.type && number.type.guid) || undefined
    };
  }

  public createWebsite(website?: Partial<Website>) {
    return {
      url: (website && website.url) || '',
      type: (website && website.type && website.type.guid) || undefined
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

  public submitLockdown() {
    const lockdown = this.form.getRawValue();

    lockdown.info.isLockdown = lockdown.info.isLockdown[0] === 'true' ? true : false;
    lockdown.info.startDate = lockdown.info.isLockdown === true ? lockdown.info.startDate : undefined;
    lockdown.info.endDate = lockdown.info.isLockdown === true ? lockdown.info.endDate : undefined;

    return this.ls.submitLockdown(lockdown).subscribe((res) => {
      console.log('Lockdown submit response:', res);
    });
  }
}
