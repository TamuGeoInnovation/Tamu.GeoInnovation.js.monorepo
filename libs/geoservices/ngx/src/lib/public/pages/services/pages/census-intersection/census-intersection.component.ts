import { Component, OnInit } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';

import { CensusIntersection } from '@tamu-gisc/geoprocessing-v5';

@Component({
  selector: 'tamu-gisc-census-intersection',
  templateUrl: './census-intersection.component.html',
  styleUrls: ['./census-intersection.component.scss']
})
export class CensusIntersectionComponent implements OnInit {
  private intersection: CensusIntersection;
  public result: Observable<string>;

  public ngOnInit(): void {
    this.intersection = new CensusIntersection({
      apiKey: 'demo',
      lat: 34.0726207996348,
      lon: -118.397965182076,
      s: 'CA',
      censusYears: 'allAvailable'
    });

    this.result = this.intersection.asObservable().pipe(
      switchMap((r) => {
        return of(JSON.stringify(r, null, '   '));
      }),
      catchError((err) => {
        return of(err.toRenderableJSON(true));
      })
    );
  }
}
