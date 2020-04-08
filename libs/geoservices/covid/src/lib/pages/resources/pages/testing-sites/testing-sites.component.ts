import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { switchMap, shareReplay, pluck, filter, takeUntil } from 'rxjs/operators';

import { TestingSite, County, User } from '@tamu-gisc/covid/common/entities';
import { TestingSitesService, StatesService } from '@tamu-gisc/geoservices/data-access';
import { IdentityService } from '@tamu-gisc/geoservices/core/ngx';

@Component({
  selector: 'tamu-gisc-testing-sites',
  templateUrl: './testing-sites.component.html',
  styleUrls: ['./testing-sites.component.scss']
})
export class TestingSitesComponent implements OnInit, OnDestroy {
  public sites: Observable<Array<Partial<TestingSite>>>;

  public localCounty: Observable<Partial<County['countyFips']>>;
  public localEmail: Observable<Partial<User['email']>>;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private ts: TestingSitesService, private st: StatesService, private is: IdentityService) {}

  public ngOnInit() {
    this.is.identity
      .pipe(
        pluck('claim', 'county'),
        filter((county) => {
          return county !== undefined && county.countyFips !== undefined;
        }),
        takeUntil(this._$destroy)
      )
      .subscribe((county) => {
        this.sites = this.st.getStateByFips(county.stateFips).pipe(
          switchMap((state) => {
            return this.ts.getTestingSitesForCounty(state.name, county.name);
          }),
          shareReplay(1)
        );
      });

    this.localEmail = this.is.identity.pipe(
      pluck('user', 'email'),
      filter((email) => {
        return email !== undefined;
      })
    );

    this.localCounty = this.is.identity.pipe(
      pluck('claim', 'county', 'countyFips'),
      filter((countyFips) => countyFips !== undefined)
    );
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }
}
