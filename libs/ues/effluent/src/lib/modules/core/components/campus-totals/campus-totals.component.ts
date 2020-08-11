import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { SamplingLocationsService } from '../../services/sampling-locations.service';
import { EffluentZonesService } from '../../services/effluent-zones.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-campus-totals',
  templateUrl: './campus-totals.component.html',
  styleUrls: ['./campus-totals.component.scss']
})
export class CampusTotalsComponent implements OnInit {
  private zones: Observable<Array<esri.Graphic>>;

  public zonesSampleAverage: Observable<number>;
  public totalFocusArea: Observable<number>;
  public totalNonFocusArea: Observable<number>;

  constructor(private sls: SamplingLocationsService, private ezs: EffluentZonesService) {}

  public ngOnInit(): void {
    this.zones = this.ezs.getZonesForTier(undefined, 3).pipe(
      map((zones) => {
        return zones.map((zone) => {
          const sampleValue = this.sls.getSamplingLocation(zone.attributes.SampleNumber);

          if (sampleValue) {
            zone.attributes.Sample = sampleValue.entries.pop();
          }

          return zone;
        });
      }),
      shareReplay(1)
    );

    this.zonesSampleAverage = this.zones.pipe(
      map((zones) => {
        // Filter out any zones without any signal values because they will skew the average value.

        const validZones = zones.filter((z) => {
          return z.attributes.Sample && z.attributes.Sample.result;
        });

        return (
          validZones.reduce((acc, curr) => {
            return acc + curr.attributes.Sample.result;
          }, 0) / validZones.length
        );
      }),
      shareReplay(1)
    );

    this.totalFocusArea = this.zones.pipe(
      map((zones) => {
        return zones.reduce((acc, curr) => {
          return acc + curr.attributes.Focus;
        }, 0);
      }),
      shareReplay(1)
    );

    this.totalNonFocusArea = this.zones.pipe(
      map((zones) => {
        return zones.reduce((acc, curr) => {
          return acc + curr.attributes.Additional;
        }, 0);
      }),
      shareReplay(1)
    );
  }
}
