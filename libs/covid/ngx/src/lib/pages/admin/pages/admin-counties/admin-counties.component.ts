import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

import { CountyStats, CountyExtended } from '@tamu-gisc/covid/data-api';

import { CountiesService } from '../../../../data-access/counties/counties.service';

@Component({
  selector: 'tamu-gisc-admin-counties',
  templateUrl: './admin-counties.component.html',
  styleUrls: ['./admin-counties.component.scss']
})
export class AdminCountiesComponent implements OnInit {
  public stats: Observable<CountyStats>;
  public summary: Observable<CountySummary>;

  public counties: Observable<Array<CountyExtended>>;

  constructor(private ct: CountiesService) {}

  public ngOnInit() {
    this.stats = this.ct.getCountyStats().pipe(shareReplay(1));
    this.counties = this.ct.getCountySummary().pipe(shareReplay(1));

    this.summary = this.stats.pipe(
      map((v) => {
        return Object.entries(v).reduce(
          // Array destructure assignment requires unused `fips`
          //
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (acc, [fips, county], index, arr) => {
            acc.total++;

            if (county.claims > 0) {
              acc.touched++;
            }

            if (county.claims === 0) {
              acc.claimless++;
            }

            if (county.claims > 0 && county.sites === 0) {
              acc.siteless++;
            }

            if (index === arr.length - 1) {
              acc.coverage = ((acc.touched / acc.total) * 100).toFixed(2);
            }

            return acc;
          },
          {
            total: 0,
            touched: 0,
            claimless: 0,
            siteless: 0,
            coverage: ''
          } as CountySummary
        );
      }),
      shareReplay(1)
    );
  }
}

interface CountySummary {
  total: number;
  touched: number;
  claimless: number;
  siteless: number;
  coverage: string;
}
