import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators';

import { Lockdown } from '@tamu-gisc/covid/common/entities';

import { CountiesService } from '../../../../data-access/counties/counties.service';
import { LockdownsService } from '../../../../data-access/lockdowns/lockdowns.service';
import { StatesService } from '../../../../data-access/states/states.service';
import { UsersService } from '../../../../data-access/users/users.service';
import { UrlFormHandlerComponent } from '../url-form-handler/url-form-handler.component';

@Component({
  selector: 'tamu-gisc-admin-lockdowns',
  templateUrl: './admin-lockdowns.component.html',
  styleUrls: ['./admin-lockdowns.component.scss']
})
export class AdminLockdownsComponent extends UrlFormHandlerComponent implements OnInit {
  public lockdowns: Observable<Array<Partial<Lockdown>>>;

  constructor(
    private fb: FormBuilder,
    private st: StatesService,
    private ct: CountiesService,
    private us: UsersService,
    private ls: LockdownsService,
    private rt: ActivatedRoute
  ) {
    super(rt, fb, st, ct, us);
  }

  public ngOnInit() {
    super.ngOnInit();

    this.lockdowns = this.form.valueChanges.pipe(
      switchMap((form) => {
        return this.ls.getLockdownsAdmin(form.state, form.county, form.email);
      }),
      shareReplay(1)
    );
  }
}
