import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators';

import { County, State, User } from '@tamu-gisc/covid/common/entities';

import { CountiesService } from '../../../../data-access/counties/counties.service';
import { StatesService } from '../../../../data-access/states/states.service';
import { TestingSitesService } from '../../../../data-access/testing-sites/testing-sites.service';
import { UsersService } from '../../../../data-access/users/users.service';
import { FormattedTestingSite } from '../../../../data-access/testing-sites/testing-sites.service';

import { UrlFormHandlerComponent } from '../url-form-handler/url-form-handler.component';

@Component({
  selector: 'tamu-gisc-admin-testing-sites',
  templateUrl: './admin-testing-sites.component.html',
  styleUrls: ['./admin-testing-sites.component.scss']
})
export class AdminTestingSitesComponent extends UrlFormHandlerComponent implements OnInit {
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
    private ts: TestingSitesService,
    private rt: ActivatedRoute
  ) {
    super(rt, fb, st, ct, us);
  }

  public ngOnInit() {
    super.ngOnInit();

    this.sites = this.form.valueChanges.pipe(
      switchMap((form) => {
        return this.ts.getTestingSitesAdmin(form.state, form.county, form.email);
      }),
      shareReplay(1)
    );
  }
}
