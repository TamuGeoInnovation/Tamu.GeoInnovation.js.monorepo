import { Component, OnInit } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';

import { CensusIntersection, CensusYear } from '@tamu-gisc/geoprocessing-v5';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-census-intersection',
  templateUrl: './census-intersection.component.html',
  styleUrls: ['./census-intersection.component.scss']
})
export class CensusIntersectionComponent implements OnInit {
  private intersection: CensusIntersection;
  public result: Observable<string>;

  public url: string;

  constructor(private readonly env: EnvironmentService) {}

  public ngOnInit(): void {
    this.intersection = new CensusIntersection({
      apiKey: 'demo',
      lat: 34.0726207996348,
      lon: -118.397965182076,
      s: 'CA',
      censusYears: CensusYear.AllAvailable
    });

    this.result = this.intersection.asObservable().pipe(
      switchMap((r) => {
        return of(JSON.stringify(r, null, '   '));
      }),
      catchError((err) => {
        return of(err.toRenderableJSON(true));
      })
    );

    this.url = this.env.value('accounts_url') + '/UserServices/Databases/Upload/Step1.aspx';
  }
}
