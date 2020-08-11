import { Component, OnInit, Input } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-coverage-chart',
  templateUrl: './coverage-chart.component.html',
  styleUrls: ['./coverage-chart.component.scss']
})
export class CoverageChartComponent implements OnInit {
  @Input()
  public zones: Observable<esri.Graphic | Array<esri.Graphic>>;

  public source: Observable<unknown>;

  public totalFocusArea: Observable<number>;
  public totalNonFocusArea: Observable<number>;

  public campusAreaOptions = {
    legend: {
      position: 'bottom'
    }
  };

  constructor() {}

  public ngOnInit(): void {
    this.totalFocusArea = this.zones.pipe(
      map((zones) => {
        if (zones instanceof Array) {
          return zones.reduce((acc, curr) => {
            return acc + curr.attributes.Focus;
          }, 0);
        } else {
          return zones.attributes.Focus;
        }
      }),
      shareReplay(1)
    );

    this.totalNonFocusArea = this.zones.pipe(
      map((zones) => {
        if (zones instanceof Array) {
          return zones.reduce((acc, curr) => {
            return acc + curr.attributes.Additional;
          }, 0);
        } else {
          return zones.attributes.Additional;
        }
      }),
      shareReplay(1)
    );

    this.source = combineLatest([this.totalFocusArea, this.totalNonFocusArea]).pipe(
      map(([focus, additional]) => {
        return {
          datasets: [
            {
              data: [focus, additional]
            }
          ],
          labels: ['Focus', 'Non-Focus']
        };
      })
    );
  }
}
