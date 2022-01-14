import { Component, OnInit } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { switchMap, pluck, filter, shareReplay, take } from 'rxjs/operators';

import { County, User } from '@tamu-gisc/covid/common/entities';
import { STATUS } from '@tamu-gisc/covid/common/enums';

import { IdentityService } from '../../../../services/identity.service';
import { FormattedTestingSite, TestingSitesService } from '../../../../data-access/testing-sites/testing-sites.service';
import { StatesService } from '../../../../data-access/states/states.service';

@Component({
  selector: 'tamu-gisc-testing-sites',
  templateUrl: './testing-sites.component.html',
  styleUrls: ['./testing-sites.component.scss']
})
export class TestingSitesComponent implements OnInit {
  public sites: Observable<Array<Partial<FormattedTestingSite>>>;

  public localCounty: Observable<Partial<County['countyFips']>>;
  public localEmail: Observable<Partial<User['email']>>;
  public claimStatuses: Observable<Array<number>>;

  public countyIsSiteLess: Observable<boolean>;

  constructor(private ts: TestingSitesService, private st: StatesService, private is: IdentityService) {}

  public ngOnInit() {
    this.sites = this.is.identity.pipe(
      pluck('claim', 'county'),
      filter((county) => {
        return county !== undefined && county.countyFips !== undefined;
      }),
      switchMap((county) => {
        return this.ts.getTestingSitesForCounty(county.countyFips);
      }),
      shareReplay(1)
    );

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

    this.claimStatuses = this.is.identity.pipe(
      pluck('claim', 'statuses'),
      filter((statuses) => statuses !== undefined),
      switchMap((statuses) => {
        return of(statuses.map((s) => s.type.id));
      })
    );

    this.countyIsSiteLess = this.claimStatuses.pipe(
      switchMap((statusIds) => {
        return of(statusIds.includes(STATUS.CLAIM_SITE_LESS));
      })
    );
  }

  public markAsSiteLes() {
    this.localCounty.pipe(take(1)).subscribe((county) => {
      this.ts.registerCountyAsTestingSiteLess(county).subscribe((res) => {
        this.is.refresh();
      });
    });
  }
}
