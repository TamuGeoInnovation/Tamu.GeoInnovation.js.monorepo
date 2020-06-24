import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { State, County, User } from '@tamu-gisc/covid/common/entities';
import { StatesService, UsersService, CountiesService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-url-form-handler',
  template: ''
})
export class UrlFormHandlerComponent implements AfterViewInit, OnInit {
  public form: FormGroup;

  public states: Observable<Array<Partial<State>>>;
  public counties: Observable<Array<Partial<County>>>;
  public users: Observable<Array<Partial<User>>>;

  constructor(
    private route: ActivatedRoute,
    private builder: FormBuilder,
    private statesService: StatesService,
    private countiesService: CountiesService,
    private usersService: UsersService
  ) {}

  public ngOnInit() {
    this.form = this.builder.group({
      state: [undefined],
      county: [undefined],
      email: [undefined]
    });

    this.states = this.statesService.getStates();
    this.users = this.usersService.getUsers();

    this.counties = this.form.get('state').valueChanges.pipe(
      switchMap((stateFips) => {
        return this.countiesService.getCountiesForState(stateFips);
      })
    );
  }

  public ngAfterViewInit() {
    const initialFormValue = {
      state: undefined,
      county: undefined,
      email: undefined
    };

    // Pre-populate form with query param values
    if (Object.keys(this.route.snapshot.queryParams).length > 0) {
      const params = this.route.snapshot.queryParams;

      if (params.state && !isNaN(params.state)) {
        initialFormValue.state = parseInt(params.state, 10);
      }

      if (params.county && !isNaN(params.county)) {
        initialFormValue.county = parseInt(params.county, 10);
      }

      if (params.email && params.email.length > 0) {
        initialFormValue.email = params.email;
      }
    }

    // Prevent the changed-after-it-has-changed error
    setTimeout(() => {
      this.form.patchValue(initialFormValue);
    }, 0);
  }
}
