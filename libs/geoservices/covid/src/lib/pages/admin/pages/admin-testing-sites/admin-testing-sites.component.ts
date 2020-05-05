import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

import { County, State, User } from '@tamu-gisc/covid/common/entities';
import {
  CountiesService,
  StatesService,
  TestingSitesService,
  UsersService,
  FormattedTestingSite
} from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-admin-testing-sites',
  templateUrl: './admin-testing-sites.component.html',
  styleUrls: ['./admin-testing-sites.component.scss']
})
export class AdminTestingSitesComponent implements OnInit {
  public form: FormGroup;

  public states: Observable<Array<Partial<State>>>;
  public counties: Observable<Array<Partial<County>>>;
  public users: Observable<Array<Partial<User>>>;
  public sites: Observable<Array<Partial<FormattedTestingSite>>>;

  constructor(
    private fb: FormBuilder,
    private us: UsersService,
    private st: StatesService,
    private ct: CountiesService,
    private ts: TestingSitesService
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
        return this.ct.getCountiesForState(stateFips);
      })
    );

    this.sites = this.form.valueChanges.pipe(
      startWith({}),
      switchMap((form) => {
        return this.ts.getTestingSitesAdmin(form.state, form.county, form.email);
      })
    );
  }
}
