import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

import { County, Lockdown, State, User } from '@tamu-gisc/covid/common/entities';
import { CountiesService, LockdownsService, StatesService, UsersService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-admin-lockdowns',
  templateUrl: './admin-lockdowns.component.html',
  styleUrls: ['./admin-lockdowns.component.scss']
})
export class AdminLockdownsComponent implements OnInit {
  public form: FormGroup;

  public states: Observable<Array<Partial<State>>>;
  public counties: Observable<Array<Partial<County>>>;
  public users: Observable<Array<Partial<User>>>;
  public lockdowns: Observable<Array<Partial<Lockdown>>>;

  constructor(
    private fb: FormBuilder,
    private st: StatesService,
    private ct: CountiesService,
    private us: UsersService,
    private ls: LockdownsService
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

    this.lockdowns = this.form.valueChanges.pipe(
      startWith({}),
      switchMap((form) => {
        return this.ls.getLockdownsAdmin(form.state, form.county, form.email);
      })
    );
  }
}
