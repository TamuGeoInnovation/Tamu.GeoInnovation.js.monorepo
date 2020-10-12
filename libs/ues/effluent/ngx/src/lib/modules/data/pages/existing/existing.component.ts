import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { Group } from '@tamu-gisc/common/utils/collection';
import { Result } from '@tamu-gisc/ues/effluent/common/entities';

import { ResultsService } from '../../../data-access/results/results.service';
import { LocationsService } from '../../../data-access/locations/locations.service';

@Component({
  selector: 'tamu-gisc-existing',
  templateUrl: './existing.component.html',
  styleUrls: ['./existing.component.scss']
})
export class ExistingComponent implements OnInit {
  public tableData: Observable<IExistingDataTableData>;

  constructor(private resultsService: ResultsService, private locationsService: LocationsService) {}

  public ngOnInit(): void {
    this.tableData = forkJoin([this.locationsService.getLocations(), this.resultsService.getResults()]).pipe(
      map(([locations, results]) => {
        return {
          fields: locations.map((location) => {
            return `${location.tier}-${location.sample}`;
          }),
          days: results
        };
      }),
      shareReplay(1)
    );
  }
}

export interface IExistingDataTableData {
  fields: Array<string>;
  days: Array<Group<Result>>;
}
