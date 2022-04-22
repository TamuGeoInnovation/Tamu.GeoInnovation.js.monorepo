import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IEffluentTierMetadata } from '../../../types/types';

@Component({
  selector: 'tamu-gisc-building-type-chart',
  templateUrl: './building-type-chart.component.html',
  styleUrls: ['./building-type-chart.component.scss']
})
export class BuildingTypeChartComponent implements OnInit {
  @Input()
  public buildings: Observable<IEffluentTierMetadata | Array<IEffluentTierMetadata>>;

  public source: Observable<unknown>;

  public chartOptions = {
    legend: {
      position: 'bottom'
    }
  };

  public ngOnInit(): void {
    this.source = this.buildings.pipe(
      map((buildings) => {
        if (buildings instanceof Array === false) {
          return [buildings];
        } else {
          return buildings;
        }
      }),
      map((buildings: Array<IEffluentTierMetadata>) => {
        const counts = buildings.reduce((acc, curr) => {
          if (acc[curr.classification] !== undefined) {
            acc[curr.classification]++;
          } else {
            acc[curr.classification] = 0;
          }

          return acc;
        }, {});

        return {
          datasets: [
            {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              data: Object.entries(counts).map(([key, value]) => {
                return value;
              })
            }
          ],
          labels: Object.keys(counts)
        };
      })
    );
  }
}
