import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Observable, Subject, of, merge, concat, forkJoin } from 'rxjs';
import {
  switchMap,
  take,
  withLatestFrom,
  shareReplay,
  map,
  pluck,
  filter,
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';

import {
  County,
  State,
  PhoneNumberType,
  PhoneNumber,
  User,
  CountyClaim,
  WebsiteType,
  Website
} from '@tamu-gisc/covid/common/entities';
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
  public phoneTypes: Observable<Array<Partial<PhoneNumberType>>>;
  public websiteTypes: Observable<Array<Partial<WebsiteType>>>;

  /**
   * Represents the active county claims for the selected county
   */
  public countyClaims: Observable<Array<Partial<CountyClaim>>>;

  public countyClaimable: Observable<boolean>;

  public localCounty: Observable<Partial<County>>;
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
    private cs: CountyClaimsService,
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
      pluck('county'),
      filter((county) => {
        return county !== undefined && county.countyFips !== undefined;
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
    this.phoneTypes = this.pt.getPhoneNumberTypes();

    this.websiteTypes = this.wt.getWebsiteTypes();

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

          const websites = this.ws.getWebsitesForCounty(
            typeof countyOrCountyFips === 'number' ? countyOrCountyFips : countyOrCountyFips.countyFips
          );

          return forkJoin([phoneNumbers, websites]);
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
        return this.cs.getActiveClaimsForCounty(countyFips);
      }),
      shareReplay(1)
    );

    this.countyClaimable = merge(this.countyClaims, this.form.get('county').valueChanges).pipe(
      withLatestFrom(this.localIdentity),
      map(([claims, user]) => {
        if (claims instanceof Array) {
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

    // Claim pipeline
    const claim = this.localIdentity.pipe(
      take(1),
      switchMap((user) => {
        return this.is.registerCountyClaim(user.email, formValue.county);
      })
    );

    // Phone number pipeline. Will execute after claim
    const phoneNumbers = this.localCounty.pipe(take(1)).pipe(
      switchMap((cnty) => {
        return this.pn.setPhoneNumbersForCounty(formValue.phoneNumbers, cnty.countyFips);
      })
    );

    // Website pipeline. Will execute after claim
    const websites = this.localCounty.pipe(take(1)).pipe(
      switchMap((cnty) => {
        return this.ws.setWebsitesForCounty(formValue.websites, cnty.countyFips);
      })
    );

    concat(claim, forkJoin([phoneNumbers, websites])).subscribe((res) => {
      console.log('Claim and phone numbers updated: ', res);
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
      type: (number && number.type && number.type.guid) || undefined,
      guid: (number && number.guid) || undefined
    };
  }

  public createWebsite(website?: Partial<Website>) {
    return {
      url: (website && website.url) || '',
      type: (website && website.type && website.type.guid) || undefined,
      guid: (website && website.guid) || undefined
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
}
