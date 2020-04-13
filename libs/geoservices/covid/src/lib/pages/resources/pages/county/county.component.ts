import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Observable, Subject, of, merge, concat, forkJoin, iif, EMPTY } from 'rxjs';
import {
  switchMap,
  take,
  withLatestFrom,
  shareReplay,
  map,
  pluck,
  filter,
  distinctUntilChanged,
  takeUntil,
  timeoutWith
} from 'rxjs/operators';

import { County, State, User, CountyClaim, FieldCategory, EntityValue } from '@tamu-gisc/covid/common/entities';
import {
  CountiesService,
  StatesService,
  PhoneNumberTypesService,
  PhoneNumbersService,
  CountyClaimsService,
  WebsiteTypesService,
  WebsitesService
} from '@tamu-gisc/geoservices/data-access';
import { IdentityService } from '@tamu-gisc/geoservices/core/ngx';
import { DeepPartial } from 'typeorm';

const storageOptions = { primaryKey: 'tamu-covid-vgi' };

@Component({
  selector: 'tamu-gisc-county',
  templateUrl: './county.component.html',
  styleUrls: ['./county.component.scss']
})
export class CountyComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public counties: Observable<Array<Partial<County>>>;
  public states: Observable<Array<Partial<State>>>;
  public phoneTypes: Observable<Partial<FieldCategory>>;
  public websiteTypes: Observable<Partial<FieldCategory>>;

  /**
   * Represents the active county claims for the selected county
   */
  public countyClaims: Observable<Array<Partial<CountyClaim>>>;

  public countyClaimable: Observable<boolean>;

  public localCounty: Observable<DeepPartial<County>>;
  public localIdentity: Observable<Partial<User>>;

  public formCounty: Observable<number>;
  public formState: Observable<number>;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private fb: FormBuilder,
    private county: CountiesService,
    private state: StatesService,
    private pt: PhoneNumberTypesService,
    private pn: PhoneNumbersService,
    private wt: WebsiteTypesService,
    private ws: WebsitesService,
    private cl: CountyClaimsService,
    private is: IdentityService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      state: [undefined, Validators.required],
      county: [undefined, Validators.required],
      phoneNumbers: this.fb.array([this.createPhoneNumberGroup()]),
      websites: this.fb.array([this.createPhoneNumberGroup()])
    });

    // User identity from identity service
    this.localIdentity = this.is.identity.pipe(pluck('user'));

    // County assignment from identity service, filtering out any undefined values to prevent
    // downstream effects when a non-valid value.
    this.localCounty = this.is.identity.pipe(
      pluck('claim', 'county'),
      switchMap((county) => {
        return county !== undefined && county.countyFips !== undefined ? of(county) : EMPTY;
      })
    );

    // Set state and form values whenever the local county local county assignment changes.
    this.localCounty.pipe(takeUntil(this._$destroy)).subscribe((county) => {
      this.form.patchValue({
        state: county.stateFips,
        county: county.countyFips
      });
    });

    this.formCounty = this.form
      .get('county')
      .valueChanges.pipe(filter((fips) => fips !== undefined && fips !== 'undefined'));

    this.formState = this.form
      .get('state')
      .valueChanges.pipe(filter((state) => state !== undefined && state !== 'undefined'));

    // List of phone types
    this.phoneTypes = this.pt.getPhoneNumberTypes().pipe(shareReplay(1));

    this.websiteTypes = this.wt.getWebsiteTypes().pipe(shareReplay(1));

    // List of states
    this.states = this.state.getStates();

    // Sync county list with state selection
    this.counties = merge(this.localCounty.pipe(pluck('stateFips')), this.form.get('state').valueChanges).pipe(
      distinctUntilChanged(),
      switchMap((fips) => {
        if (fips === undefined || fips === 'undefined') {
          return of([]);
        }

        return this.county.getCountiesForState(fips);
      })
    );

    // Merge local county, county form value, and county state value and use them
    // as schedulers to retrieve phone numbers for the selected county.
    merge(
      // Use the countyFips value for the local county value to load the phone numbers for that county.
      this.localCounty,
      // County form control emits countyFips, This can be used to retrieve a list of phone numbers
      // for the selected county.
      this.formCounty,
      // Since state form control emits stateFips, it cannot be used to get the selected county,
      // so instead map it to an undefined value that will be used as a signal to clear the
      // phone numbers whenever a new state is selected.
      this.formState.pipe(switchMap(() => of(undefined)))
    )
      .pipe(
        switchMap((countyOrCountyFips: Partial<County> | number) => {
          if (countyOrCountyFips === undefined) {
            // Return empty array to symbolize no phone numbers for selected county.
            return of([]);
          }

          // If valid county fips, get phone numbers for it.
          const phoneNumbers = this.pn.getPhoneNumbersForCounty(
            typeof countyOrCountyFips === 'number' ? countyOrCountyFips : countyOrCountyFips.countyFips
          );

          // const websites = this.ws.getWebsitesForCounty(
          //   typeof countyOrCountyFips === 'number' ? countyOrCountyFips : countyOrCountyFips.countyFips
          // );

          // return forkJoin([phoneNumbers, websites]);
        })
      )
      .subscribe(([numbers, websites]) => {
        const phoneGroup = this.form.get('phoneNumbers') as FormArray;
        const websiteGroup = this.form.get('websites') as FormArray;

        if (numbers && numbers.length > 0) {
          // // Clear any empty phone number fields
          phoneGroup.clear();

          // Format the response phone numbers to a suitable form group structure
          numbers.map((n) => phoneGroup.push(this.createPhoneNumberGroup(n)));
        } else {
          phoneGroup.clear();
        }

        if (websites && websites.length > 0) {
          // // Clear any empty website fields
          websiteGroup.clear();

          // Format the response websites to a suitable form group structure
          websites.map((n) => websiteGroup.push(this.createWebsiteGroup(n)));
        } else {
          websiteGroup.clear();
        }
      });

    this.countyClaims = merge(this.localCounty.pipe(pluck('countyFips')), this.formCounty).pipe(
      switchMap((countyFips: number) => {
        return this.cl.getActiveClaimsForCounty(countyFips);
      }),
      shareReplay(1)
    );

    this.countyClaimable = merge(this.countyClaims, this.form.get('county').valueChanges).pipe(
      withLatestFrom(this.localIdentity),
      map(([claims, user]) => {
        if (claims instanceof Object) {
          // If claim for selected county is equal to zero, no one has claimed it yet.
          // Mark it as available for claiming
          if (claims.length === 0) {
            return true;
          }

          // Otherwise, check if the active claim user is current user.
          // Do not allow overlapping claims for the same user and county
          return claims.findIndex((ci) => ci.user.guid === user.guid) > -1;
        } else {
          return false;
        }
      })
    );
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public submitCountyOwnership() {
    const formValue = this.form.getRawValue();

    forkJoin([
      this.is.identity.pipe(take(1)),
      this.localCounty.pipe(
        take(1),
        timeoutWith(100, of(undefined))
      )
    ])
      .pipe(
        switchMap(([identity, county]) => {
          return this.is.registerCountyClaim(
            {
              guid: identity && identity.claim && identity.claim.guid ? identity.claim.guid : undefined,
              user: {
                email: identity.user.email
              },
              county: {
                // Use local county value if available.
                // Will not be available for initial claims, so use form county value.
                countyFips: county ? county.countyFips : formValue.county
              }
            },
            formValue.phoneNumbers.length > 0 ? formValue.phoneNumbers : undefined,
            formValue.websites.length > 0 ? formValue.websites : undefined
          );
        })
      )
      .subscribe((res) => {
        console.log(res);
      });
  }

  public createPhoneNumberGroup(number?: DeepPartial<EntityValue>): FormGroup {
    return this.fb.group(this.createPhoneNumber(number));
  }

  public createWebsiteGroup(website?: DeepPartial<EntityValue>): FormGroup {
    return this.fb.group(this.createWebsite(website));
  }

  public createPhoneNumber(number?: DeepPartial<EntityValue>): DeepPartial<EntityValue> {
    return {
      // entityGuid: number && number.entityGuid,
      value: this.fb.group({
        value: number && number.value && number.value.value,
        type: number && number.value && number.value.type
      })
    };
  }

  public createWebsite(website?: DeepPartial<EntityValue>): DeepPartial<EntityValue> {
    return {
      // entityGuid: website && website.entityGuid,
      value: this.fb.group({
        value: website.value && website.value.value,
        type: website && website.value && website.value.type
      })
    };
  }

  /**
   * Push a phone number form group to the form array
   */
  public addPhoneNumber() {
    (this.form.get('phoneNumbers') as FormArray).push(this.createPhoneNumberGroup());
  }

  public addWebsite() {
    (this.form.get(['websites']) as FormArray).push(this.createWebsiteGroup());
  }

  public removeFormArrayControl(collection: string, index: number) {
    (this.form.get([collection]) as FormArray).removeAt(index);
  }
}
