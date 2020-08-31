import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { IAverageResponse } from '@tamu-gisc/ues/effluent/data-api';
import { IEffluentTierMetadata } from '@tamu-gisc/ues/common/ngx';

import { ResultsService } from '../../../data-access/results/results.service';
import { SamplingLocationsService } from '../../services/sampling-locations.service';
import { EffluentZonesService } from '../../services/effluent-zones.service';
import { SamplingBuildingsService } from '../../services/sampling-buildings.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-campus-totals',
  templateUrl: './campus-totals.component.html',
  styleUrls: ['./campus-totals.component.scss']
})
export class CampusTotalsComponent implements OnInit {
  public zones: Observable<Array<esri.Graphic>>;
  public buildings: Observable<Array<IEffluentTierMetadata>>;

  public zonesSampleAverage: Observable<IAverageResponse>;

  constructor(
    private sls: SamplingLocationsService,
    private ezs: EffluentZonesService,
    private ebs: SamplingBuildingsService,
    private rss: ResultsService
  ) {}

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

    this.zonesSampleAverage = this.rss.getLatestResultsAverage().pipe(shareReplay(1));

    this.buildings = of(
      this.ebs.getBuildingsIn({
        tier: 3
      })
    );
  }
}
