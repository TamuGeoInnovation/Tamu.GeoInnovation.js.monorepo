import { Component, OnInit } from '@angular/core';
import { Observable, filter, mergeMap, pipe, shareReplay, toArray } from 'rxjs';

import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';
import { SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-sponsors-main',
  templateUrl: './sponsors-main.component.html',
  styleUrls: ['./sponsors-main.component.scss']
})
export class SponsorsMainComponent implements OnInit {
  private _sponsors$: Observable<Array<Partial<Sponsor>>>;
  public rasterSponsors$: Observable<Array<Partial<Sponsor>>>;
  public polygonSponsors$: Observable<Array<Partial<Sponsor>>>;
  public lineSponsors$: Observable<Array<Partial<Sponsor>>>;
  public pointSponsors$: Observable<Array<Partial<Sponsor>>>;

  constructor(private readonly ss: SponsorService) {}

  public ngOnInit(): void {
    this._sponsors$ = this.ss.getEntities().pipe(shareReplay());
    this.rasterSponsors$ = this._sponsors$.pipe(this.filterSponsors('raster'));
    this.polygonSponsors$ = this._sponsors$.pipe(this.filterSponsors('polygon'));
    this.lineSponsors$ = this._sponsors$.pipe(this.filterSponsors('line'));
    this.pointSponsors$ = this._sponsors$.pipe(this.filterSponsors('point'));
  }

  public filterSponsors(type: Sponsor['sponsorshipLevel']) {
    return pipe(
      mergeMap((sponsors: Array<Partial<Sponsor>>) => sponsors),
      filter((s) => {
        return s.sponsorshipLevel === type;
      }),
      toArray()
    );
  }
}
