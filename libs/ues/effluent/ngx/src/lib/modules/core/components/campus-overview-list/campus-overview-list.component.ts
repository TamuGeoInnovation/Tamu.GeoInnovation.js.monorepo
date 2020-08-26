import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IEffluentTierMetadata } from '@tamu-gisc/ues/common/ngx';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { FeatureHighlightService } from '@tamu-gisc/maps/feature/feature-highlight';

import { EffluentZonesService } from '../../services/effluent-zones.service';
import { SamplingLocationsService } from '../../services/sampling-locations.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-campus-overview-list',
  templateUrl: './campus-overview-list.component.html',
  styleUrls: ['./campus-overview-list.component.scss']
})
export class CampusOverviewListComponent implements OnInit {
  public zones: Observable<Array<esri.Graphic>>;
  public buildings: Observable<Array<IEffluentTierMetadata>>;

  constructor(
    private ez: EffluentZonesService,
    private ec: SamplingLocationsService,
    private ms: EsriMapService,
    private hs: FeatureHighlightService
  ) {}

  public ngOnInit(): void {
    this.zones = this.ez.getZonesForTier(undefined, 3).pipe(
      map((results) => {
        return results.sort((a, b) => {
          // Parse out the zone into a number so the sorting works correctly.
          const aZone = parseInt(a.attributes.SampleNumber.split('-').pop(), 10);
          const bZone = parseInt(b.attributes.SampleNumber.split('-').pop(), 10);

          if (aZone < bZone) {
            return -1;
          } else if (aZone > bZone) {
            return 1;
          } else {
            return 0;
          }
        });
      }),
      map((zones) => {
        return zones.map((zone) => {
          const s = this.ec.getSamplingLocation(zone.attributes.SampleNumber);

          if (s) {
            zone.attributes.Signal = s.entries.pop();
          }

          return zone;
        });
      })
    );
  }
}
