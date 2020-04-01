import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { switchMap, startWith, take, withLatestFrom } from 'rxjs/operators';

import { County, State } from '@tamu-gisc/covid/common/entities';
import { CountiesService, StatesService } from '@tamu-gisc/geoservices/data-access';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

const storageOptions = { primaryKey: 'tamu-covid-vga' };

@Component({
  selector: 'tamu-gisc-county',
  templateUrl: './county.component.html',
  styleUrls: ['./county.component.scss']
})
export class CountyComponent implements OnInit {
  public form: FormGroup;
  public counties: Observable<Array<Partial<County>>>;
  public states: Observable<Array<Partial<State>>>;
  public claimUpdate: Subject<boolean> = new Subject();

  public localCounty: Observable<Partial<County>>;
  public localEmail: string;

  constructor(
    private fb: FormBuilder,
    private localStore: LocalStoreService,
    private county: CountiesService,
    private state: StatesService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      state: [undefined, Validators.required],
      county: [undefined, Validators.required]
    });

    this.localEmail = this.localStore.getStorageObjectKeyValue({ ...storageOptions, subKey: 'email' });

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
          return this.county.getClaimsForUser(this.localEmail);
        }),
        withLatestFrom(this.localCounty)
      )
      .subscribe(([user, county]) => {
        // Do a simple check to see if the user claimed counties contain the locally referenced one.
        const matching = user.claimedCounties.find((c) => c.countyFips === county.countyFips);

        // If locally referenced county is same as on server, update the form to reflect the current claim state
        //
        // Otherwise, set it to whatever the server has
        if (matching) {
          this.form.setValue({
            state: matching.stateFips,
            county: matching.countyFips
          });
        } else {
          // Ensure that the user has ANY claims, at all before attempting to set values.
          if (user.claimedCounties.length > 0) {
            this.form.setValue({
              state: user.claimedCounties[0].stateFips,
              county: user.claimedCounties[0].countyFips
            });
          }
        }
      });
  }

  public submitCountyOwnership() {
    this.county.registerUserToCounty(this.localEmail, this.form.getRawValue().county).subscribe((res) => {
      const verify = res.claimedCounties.find((c) => c.countyFips === this.form.getRawValue().county);

      if (verify) {
        this.localStore.setStorageObjectKeyValue({ ...storageOptions, subKey: 'county', value: verify });

        // Trigger a local county value update
        this.claimUpdate.next();
      }
    });
  }
}
