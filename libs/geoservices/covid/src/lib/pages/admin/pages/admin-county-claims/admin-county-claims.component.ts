import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import { STATUS } from '@tamu-gisc/covid/common/enums';
import { County, CountyClaim, State, User } from '@tamu-gisc/covid/common/entities';
import { CountiesService, CountyClaimsService, StatesService, UsersService } from '@tamu-gisc/geoservices/data-access';

import { UrlFormHandlerComponent } from '../url-form-handler/url-form-handler.component';

@Component({
  selector: 'tamu-gisc-admin-county-claims',
  templateUrl: './admin-county-claims.component.html',
  styleUrls: ['./admin-county-claims.component.scss']
})
export class AdminCountyClaimsComponent extends UrlFormHandlerComponent implements OnInit {
  public form: FormGroup;

  public states: Observable<Array<Partial<State>>>;
  public counties: Observable<Array<Partial<County>>>;
  public claims: Observable<Array<Partial<CalculatedCountyClaim>>>;
  public users: Observable<Array<Partial<User>>>;

  public updatedClaim: BehaviorSubject<Partial<CountyClaim>> = new BehaviorSubject(undefined);
  public formClaims: Observable<Array<Partial<CalculatedCountyClaim>>>;

  constructor(
    private fb: FormBuilder,
    private cs: CountiesService,
    private st: StatesService,
    private cl: CountyClaimsService,
    private us: UsersService,
    private rt: ActivatedRoute
  ) {
    super(rt, fb, st, cs, us);
  }

  public ngOnInit() {
    super.ngOnInit();

    this.formClaims = this.form.valueChanges.pipe(
      switchMap((form) => {
        return this.cl.getAdminClaims(form.state, form.county, form.email);
      }),
      shareReplay(1)
    );

    this.claims = combineLatest([this.formClaims, this.updatedClaim]).pipe(
      map(([calculated, updated]) => {
        if (updated) {
          const target = calculated.find((c) => c.guid === updated.guid);

          if (target) {
            target.statuses = updated.statuses;
          }
        }

        return calculated;
      }),
      map((claims) => {
        return claims.map(
          (c): CalculatedCountyClaim => {
            const closed = c.statuses.find((s) => s.type.id === STATUS.CLOSED);

            const duration =
              closed === undefined
                ? Date.now() - Date.parse((c.created as unknown) as string)
                : Date.parse((closed.created as unknown) as string) - Date.parse((c.created as unknown) as string);

            return { ...c, active: closed === undefined, duration: (duration / 1000 / 60).toFixed(2) };
          }
        );
      }),
      shareReplay(1)
    );
  }

  public closeClaim(claim: Partial<CountyClaim>) {
    this.cl.closeClaim(claim.guid).subscribe((res) => {
      this.updatedClaim.next(res);
    });
  }
}

export interface CalculatedCountyClaim extends Partial<CountyClaim> {
  active: boolean;
  duration: number | string;
}
