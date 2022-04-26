import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { IEffluentTierMetadata } from '../../../types/types';
import { EffluentZonesService } from '../../services/effluent-zones.service';
import { ResultsService } from '../../../data-access/results/results.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-campus-overview-list',
  templateUrl: './campus-overview-list.component.html',
  styleUrls: ['./campus-overview-list.component.scss']
})
export class CampusOverviewListComponent implements OnInit {
  public zones: Observable<Array<esri.Graphic>>;
  public buildings: Observable<Array<IEffluentTierMetadata>>;

  constructor(private ez: EffluentZonesService, private rs: ResultsService) {}

  public ngOnInit(): void {
    this.zones = forkJoin([this.ez.getZonesForTier(undefined, 3), this.rs.getLatestResults()]).pipe(
      map(([zones, results]) => {
        return zones.map((zone) => {
          const matching = results.find((r) => {
            return `${r.location.tier}-${r.location.sample}` === zone.attributes.SampleNumber;
          });

          if (matching !== undefined) {
            zone.attributes.Signal = matching.value;
          }

          return zone;
        });
      })
    );
  }
}
