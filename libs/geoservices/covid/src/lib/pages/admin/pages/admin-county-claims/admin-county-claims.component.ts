import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { County, CountyClaim, State, User } from '@tamu-gisc/covid/common/entities';
import { STATUS } from '@tamu-gisc/covid/common/enums';
import { CountiesService, CountyClaimsService, StatesService, UsersService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-admin-county-claims',
  templateUrl: './admin-county-claims.component.html',
  styleUrls: ['./admin-county-claims.component.scss']
})
export class AdminCountyClaimsComponent implements OnInit {
  public form: FormGroup;

  public states: Observable<Array<Partial<State>>>;
  public counties: Observable<Array<Partial<County>>>;
  public claims: Observable<Array<Partial<CalculatedCountyClaim>>>;
  public users: Observable<Array<Partial<User>>>;

  constructor(
    private fb: FormBuilder,
    private cs: CountiesService,
    private st: StatesService,
    private cl: CountyClaimsService,
    private us: UsersService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      state: [undefined],
      county: [undefined],
      email: [undefined]
    });

    this.states = this.st.getStates();
    this.users = this.us.getUsers();

    this.counties = this.form.get('state').valueChanges.pipe(
      switchMap((stateFips) => {
        return this.cs.getCountiesForState(stateFips);
      })
    );

    this.claims = this.form.valueChanges.pipe(
      startWith({}),
      switchMap((form) => {
        return this.cl.getAdminClaims(form.state, form.county, form.email);
      }),
      map((claims) => {
        return claims.map(
          (c): CalculatedCountyClaim => {
            const closed = c.statuses.find((s) => s.type.id === STATUS.CLOSED);

            const duration =
              closed === undefined
                ? Date.now() - Date.parse((c.created as unknown) as string)
                : Date.parse((closed.created as unknown) as string) - Date.parse((c.created as unknown) as string);

            return { ...c, active: closed !== undefined, duration: (duration / 1000 / 60).toFixed(2) };
          }
        );
      }),
      shareReplay(1)
    );
  }
}

export interface CalculatedCountyClaim extends Partial<CountyClaim> {
  active: boolean;
  duration: number | string;
}
