import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, of, Subject, combineLatest, timer } from 'rxjs';
import { switchMap, pluck, withLatestFrom, filter, takeUntil, take } from 'rxjs/operators';

import { County, User, FieldCategory, EntityValue } from '@tamu-gisc/covid/common/entities';
import {
  WebsiteTypesService,
  StatesService,
  LockdownsService,
  PhoneNumberTypesService,
  ActiveLockdown
} from '@tamu-gisc/geoservices/data-access';
import { IdentityService } from '@tamu-gisc/geoservices/core/ngx';
import { DeepPartial } from 'typeorm';

const storageOptions = { primaryKey: 'tamu-covid-vgi' };

@Component({
  selector: 'tamu-gisc-lockdown',
  templateUrl: './lockdown.component.html',
  styleUrls: ['./lockdown.component.scss']
})
export class LockdownComponent implements OnInit, OnDestroy {
  public form: FormGroup;

  public websitesTypes: Observable<Partial<FieldCategory>>;
  public phoneTypes: Observable<Partial<FieldCategory>>;

  public localCounty: Observable<DeepPartial<County>>;
  public localEmail: Observable<Partial<User['email']>>;

  public lockdownState: Observable<boolean>;
  public submissionStatus: Subject<number> = new Subject();

  /**
   * Describes if the current lockdown information was submitted by the
   * locally stored user identity
   */
  public lockdownIdentityMatch: Subject<boolean> = new Subject();

  private _$destroy: Subject<boolean> = new Subject();

  public lockdownOptions = [
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
    private cl: WebsiteTypesService,
    private st: StatesService,
    private ls: LockdownsService,
    private ph: PhoneNumberTypesService,
    private is: IdentityService
  ) {}

  public ngOnInit() {
    this.localCounty = this.is.identity.pipe(pluck('claim', 'county'));
    this.localEmail = this.is.identity.pipe(pluck('user', 'email'));

    this.form = this.fb.group({
      claim: this.fb.group({
        user: ['', Validators.required],
        county: ['']
      }),
      info: this.fb.group({
        isLockdown: [],
        hasUnknownEndDate: [false],
        startDate: [new Date().toISOString().split('T')[0]],
        endDate: [new Date().toISOString().split('T')[0]],
        protocol: [''],
        notes: [''],
        phoneNumbers: this.fb.array([]),
        websites: this.fb.array([])
      })
    });

    this.websitesTypes = this.cl.getWebsiteTypes();
    this.phoneTypes = this.ph.getPhoneNumberTypes();

    this.lockdownState = (this.form.controls.info as FormGroup).controls.isLockdown.valueChanges;

    // Set the county and state location fields for the form

    this.localCounty
      .pipe(filter((county) => county !== undefined && county.countyFips !== undefined && county.stateFips !== undefined))
      .subscribe((county) => {
        if (county) {
          this.st.getStateByFips(county.stateFips).subscribe((state) => {
            this.form.patchValue({
              claim: {
                county: county.countyFips
              },
              location: {
                county: county.name,
                state: state.name
              }
            });
          });
        }
      });

    // Patch the form value with the local email value
    this.localEmail
      .pipe(
        filter((email) => email !== undefined),
        take(1)
      )
      .subscribe((email) => {
        this.form.patchValue({
          claim: {
            user: email
          }
        });
      });

    combineLatest([this.localEmail, this.localCounty])
      .pipe(
        filter(([email, county]) => {
          return email !== undefined && county && county.countyFips !== undefined;
        }),
        switchMap(([email, county]) => {
          // Attempt to get an active lockdown entry for the current identity email
          return this.ls.getActiveLockdownForEmail(email).pipe(
            switchMap((al) => {
              // If a lockdown entry for the email exists, the al.info will be defined
              if (al.info !== undefined) {
                this.lockdownIdentityMatch.next(true);
                return of(al);
              } else {
                // If no existing lockdown entry for the current email, attempt to get the latest
                // lockdown entry for the county= based on the claim
                return this.ls.getLockdownForCounty(county.countyFips).pipe(
                  switchMap((lc) => {
                    // If lc.info exists, return that existing lockdown entry and mark it as
                    // not matching the current users identity.
                    if (lc && lc.info !== undefined) {
                      this.lockdownIdentityMatch.next(false);
                      return of(lc);
                    } else {
                      return of({} as ActiveLockdown);
                    }
                  })
                );
              }
            })
          );
        }),
        withLatestFrom(this.localEmail),
        takeUntil(this._$destroy)
      )
      .subscribe(([res, email]) => {
        if (Object.keys(res).length > 0) {
          const merged = {
            claim: {
              user: email,
              county: res.claim.county.countyFips
            },
            info: {
              isLockdown: res.info.isLockdown,
              hasUnknownEndDate: res.info.endDate === null ? true : false,
              startDate: res.info.startDate ? res.info.startDate.split('T')[0] : undefined,
              endDate: res.info.endDate ? res.info.endDate.split('T')[0] : undefined,
              protocol: res.info.protocol,
              notes: res.info.notes
            }
          };

          this.form.patchValue(merged);
        } else {
          const merged = {
            claim: {
              user: email
            }
          };

          this.form.patchValue(merged);
        }

        if (res && res.info && res.info.phoneNumbers) {
          const phc = this.form.get(['info', 'phoneNumbers']) as FormArray;
          res.info.phoneNumbers.forEach((n) => phc.push(this.createPhoneNumberGroup(n)));
        }

        if (res && res.info && res.info.websites) {
          const wc = this.form.get(['info', 'websites']) as FormArray;
          res.info.websites.forEach((w) => wc.push(this.createWebsiteGroup(w)));
        }
      });

    this.form.get(['info', 'hasUnknownEndDate']).valueChanges.subscribe((hasUnknownDate) => {
      const control = this.form.get(['info', 'endDate']);

      if (hasUnknownDate) {
        control.disable();
        control.patchValue(undefined);
      } else {
        control.enable();
        control.patchValue(new Date().toISOString().split('T')[0]);
      }
    });
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
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

  public submitLockdown() {
    this.submissionStatus.next(0);
    const lockdown = this.form.getRawValue();

    lockdown.info.isLockdown = lockdown.info.isLockdown;
    lockdown.info.protocol = lockdown.info.isLockdown === true ? lockdown.info.protocol : undefined;
    lockdown.info.startDate = lockdown.info.isLockdown === true ? lockdown.info.startDate : undefined;
    lockdown.info.endDate =
      lockdown.info.isLockdown === true && !lockdown.info.hasUnknownEndDate ? lockdown.info.endDate : null;

    return this.ls.submitLockdown(lockdown).subscribe((res) => {
      this.submissionStatus.next(1);

      timer(3000).subscribe(() => {
        this.submissionStatus.next(-1);
      });

      console.log('Lockdown submit response:', res);
    });
  }
}
