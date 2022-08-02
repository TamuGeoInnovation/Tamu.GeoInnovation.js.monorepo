import { Component, OnInit } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

import { CensusIntersection } from '@tamu-gisc/common/utils/geometry/geoprocessing';

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
      censusYear: '2010',
      version: '4.10'
    });

    this.result = this.intersection.execute().pipe(switchMap((r) => of(JSON.stringify(r, null, '   '))));
  }
}
