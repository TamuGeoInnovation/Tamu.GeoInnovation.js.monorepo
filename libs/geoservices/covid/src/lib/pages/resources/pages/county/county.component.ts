import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Observable, Subject, of, merge, concat, combineLatest } from 'rxjs';
import { switchMap, startWith, take, withLatestFrom, tap, shareReplay, map } from 'rxjs/operators';

import { County, State, PhoneNumberType, PhoneNumber, User, CountyClaim } from '@tamu-gisc/covid/common/entities';
import {
  CountiesService,
  StatesService,
  PhoneNumberTypesService,
  PhoneNumbersService,
  CountyClaimsService
} from '@tamu-gisc/geoservices/data-access';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

const storageOptions = { primaryKey: 'tamu-covid-vgi' };

@Component({
  selector: 'tamu-gisc-county',
  templateUrl: './county.component.html',
  styleUrls: ['./county.component.scss']
})
export class CountyComponent implements OnInit {
  public form: FormGroup;
  public counties: Observable<Array<Partial<County>>>;
  public states: Observable<Array<Partial<State>>>;
  public phoneTypes: Observable<Array<Partial<PhoneNumberType>>>;

  /**
   * Represents the active county claims for the selected county
   */
  public countyClaims: Observable<Array<Partial<CountyClaim>>>;

  public countyClaimable: Observable<boolean>;

  /**
   * Scheduler that emits whenever there is a claim status change
   *
   * Used to schedule other events that rely on a notification when that happens.
   */
  public claimUpdate: Subject<boolean> = new Subject();

  public localCounty: Observable<Partial<County>>;
  public localIdentity: Partial<User>;

  constructor(
    private fb: FormBuilder,
    private localStore: LocalStoreService,
    private county: CountiesService,
    private state: StatesService,
    private pt: PhoneNumberTypesService,
    private pn: PhoneNumbersService,
    private cs: CountyClaimsService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      state: [undefined, Validators.required],
      county: [undefined, Validators.required],
      phoneNumbers: this.fb.array([this.createPhoneNumberGroup()])
    });

    this.localIdentity = this.localStore.getStorageObjectKeyValue({ ...storageOptions, subKey: 'identity' });

    this.phoneTypes = this.pt.getPhoneNumberTypes();

    // Setup state and county list observables
    this.states = this.state.getStates();
    this.counties = this.form.controls.state.valueChanges.pipe(
      switchMap((fips) => {
        return this.county.getCountiesForState(fips);
      })
    );

    // Observable wrapper for the local store county object value
    this.localCounty = this.claimUpdate.pipe(
      startWith(true),
      switchMap((v) => {
        return of(this.localStore.getStorageObjectKeyValue({ ...storageOptions, subKey: 'county' }) as Partial<County>);
      })
    );

    // Verify county claim with server
    this.localCounty
      .pipe(
        take(1),
        switchMap((county) => {
          return this.county.getClaimsForUser(this.localIdentity.email);
        }),
        withLatestFrom(this.localCounty)
      )
      .subscribe(([claims, localCounty]) => {
        // If locally referenced county is same as on server, update the form to reflect the current claim state
        //
        // Otherwise, set it to whatever the server has
        if (localCounty) {
          // Do a simple check to see if the user claimed counties contain the locally referenced one.
          const matching = claims.find((c) => c.county.countyFips === localCounty.countyFips);

          // If no match found, wipe the local county value, otherwise leave it as is
          if (matching) {
            this.form.patchValue({
              state: matching.county.stateFips,
              county: matching.county.countyFips
            });
          } else {
            this._setLocalCounty();
          }
        } else {
          // Ensure that the user has ANY claims, at all before attempting to set values.
          if (claims.length > 0) {
            this.form.patchValue({
              state: claims[0].county.stateFips,
              county: claims[0].county.countyFips
            });

            this._setLocalCounty(claims[0].county);
          }
        }
      });

    // Merge local county, county form value, and county state value and use them
    // as schedulers to retrieve phone numbers for the selected county.
    merge(
      // Use the countyFips value for the local county value to load the phone numbers for that county.
      this.localCounty,
      // County form control emits countyFips, This can be used to retrieve a list of phone numbers
      // for the selected county.
      this.form.controls.county.valueChanges,
      // Since state form control emits stateFips, it cannot be used to get the selected county,
      // so instead map it to an undefined value that will be used as a signal to clear the
      // phone numbers whenever a new state is selected.
      this.form.controls.state.valueChanges.pipe(switchMap(() => of(undefined)))
    )
      .pipe(
        switchMap((countyOrCountyFips: Partial<County> | number) => {
          if (countyOrCountyFips === undefined) {
            return of([]);
          }
          return this.pn.getPhoneNumbersForCounty(
            typeof countyOrCountyFips === 'number' ? countyOrCountyFips : countyOrCountyFips.countyFips
          );
        })
      )
      .subscribe((numbers) => {
        const group = this.form.get('phoneNumbers') as FormArray;

        if (numbers.length > 0) {
          // // Clear any empty phone number fields
          group.clear();

          // Format the response phone numbers to a suitable form group structure
          numbers.map((n) => group.push(this.createPhoneNumberGroup(n)));
        } else {
          group.clear();
        }
      });

    this.countyClaims = this.form.controls.county.valueChanges.pipe(
      switchMap((countyFips: number) => {
        return this.cs.getActiveClaimsForCounty(countyFips);
      }),
      shareReplay(1)
    );

    this.countyClaimable = this.countyClaims.pipe(
      map((claims) => {
        if (claims.length === 0) {
          return true;
        }

        // Check if the active claim user is current user.
        return claims.findIndex((ci) => ci.user.guid === this.localIdentity.guid) > -1;
      })
    );
  }

  public submitCountyOwnership() {
    const value = this.form.getRawValue();

    // Claim pipeline
    const claim = this.county.registerUserToCounty(this.localIdentity.email, this.form.getRawValue().county).pipe(
      tap((resClaim) => {
        const verified = resClaim.county.countyFips === this.form.getRawValue().county;

        if (verified) {
          this._setLocalCounty(resClaim.county);
        }
      })
    );

    // Phone number pipeline. Will execute after claim
    const phoneNumbers = this.localCounty.pipe(take(1)).pipe(
      switchMap((cnty) => {
        return this.pn.setPhoneNumbersForCounty(value.phoneNumbers, cnty.countyFips);
      }),
      tap(() => {
        this.claimUpdate.next();
      })
    );

    concat(claim, phoneNumbers).subscribe((res) => {
      console.log(res);
    });
  }

  public createPhoneNumberGroup(number?: Partial<PhoneNumber>): FormGroup {
    return this.fb.group(this.createPhoneNumber(number));
  }

  public createPhoneNumber(number?: Partial<PhoneNumber>) {
    return {
      number: (number && number.number) || '',
      type: (number && number.type && number.type.guid) || undefined,
      guid: (number && number.guid) || undefined
    };
  }

  /**
   * Push a phone number form group to the form array
   */
  public addPhoneNumber() {
    (this.form.get('phoneNumbers') as FormArray).push(this.createPhoneNumberGroup());
  }

  /**
   * Updates the local store county value.
   *
   * If no county provided, it clears the entry from local storage.
   */
  private _setLocalCounty(county?: Partial<County>) {
    if (county) {
      this.localStore.setStorageObjectKeyValue({ ...storageOptions, subKey: 'county', value: county });
    } else {
      this.localStore.setStorageObjectKeyValue({ ...storageOptions, subKey: 'county', value: undefined });
    }

    // Trigger a local county value update
    this.claimUpdate.next();
  }
}
