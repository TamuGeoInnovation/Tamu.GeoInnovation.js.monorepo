import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of, Subject, combineLatest, timer } from 'rxjs';
import { switchMap, pluck, withLatestFrom, filter, takeUntil, shareReplay } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import { County, User } from '@tamu-gisc/covid/common/entities';

import { IdentityService } from '../../../../services/identity.service';
import { WebsiteTypesService } from '../../../../data-access/website-types/website-types.service';
import { StatesService } from '../../../../data-access/states/states.service';
import { LockdownsService } from '../../../../data-access/lockdowns/lockdowns.service';
import { PhoneNumberTypesService } from '../../../../data-access/phone-number-types/phone-number-types.service';
import { ActiveLockdown } from '../../../../data-access/lockdowns/lockdowns.service';

const storageOptions = { primaryKey: 'tamu-covid-vgi' };

@Component({
  selector: 'tamu-gisc-lockdown',
  templateUrl: './lockdown.component.html',
  styleUrls: ['./lockdown.component.scss']
})
export class LockdownComponent implements OnInit, OnDestroy {
  public form: FormGroup;

  public localCounty: Observable<DeepPartial<County>>;
  public localEmail: Observable<Partial<User['email']>>;

  public lockdownState: Observable<boolean>;
  public submissionStatus: Subject<number> = new Subject();

  public lockdown: Observable<Partial<ActiveLockdown>>;
  public email: Observable<string>;

  public lockdownEmailAndCounty: Observable<{
    lockdown: Partial<ActiveLockdown>;
    email: string;
    county: DeepPartial<County>;
  }>;

  /**
   * Describes if the current lockdown information was submitted by the
   * locally stored user identity
   */
  public lockdownIdentityMatch: Subject<boolean> = new Subject();

  private _$destroy: Subject<boolean> = new Subject();

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

    this.lockdownEmailAndCounty = combineLatest([this.localEmail, this.localCounty]).pipe(
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
      withLatestFrom(this.localEmail, this.localCounty),
      switchMap(([lockdown, email, county]) => {
        return of({ lockdown, email, county });
      }),
      takeUntil(this._$destroy),
      shareReplay(1)
    );
  }

  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public submitLockdown(formValue) {
    this.submissionStatus.next(0);

    return this.ls.submitLockdown(formValue).subscribe((res) => {
      this.submissionStatus.next(1);

      timer(3000).subscribe(() => {
        this.submissionStatus.next(-1);
      });

      console.log('Lockdown submit response:', res);
    });
  }
}
