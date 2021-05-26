import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { IChartConfiguration } from '@tamu-gisc/charts';

import { RecyclingResultsStatistics, RecyclingService } from '../../../core/services/recycling.service';

@Component({
  selector: 'tamu-gisc-recycled-trends-card',
  templateUrl: './recycled-trends-card.component.html',
  styleUrls: ['./recycled-trends-card.component.scss']
})
export class RecycledTrendsCardComponent implements OnInit {
  public chartData: Observable<IChartConfiguration['data']>;
  public selectedLocation: Observable<RecyclingResultsStatistics>;

  public chartOptions: Partial<IChartConfiguration['options']> = {
    scales: {
      xAxes: [
        {
          type: 'time'
        }
      ],
      yAxes: [
        {
          scaleLabel: {
            labelString: 'Weight (lbs)',
            display: true
          }
        }
      ]
    },
    legend: {
      position: 'bottom',
      display: false
    },
    plugins: {
      colorschemes: {
        scheme: 'brewer.Paired8'
      }
    }
  };

  constructor(private recyclingService: RecyclingService) {}

  public ngOnInit(): void {
    this.selectedLocation = this.recyclingService.allOrSelectedRecyclingStats;

    this.chartData = this.selectedLocation.pipe(
      map((locs) => {
        const data = locs.results.map((loc, index) => {
          return loc.value;
        });

        const labels = locs.results.map((l) => new Date(l.date));

        return {
          labels: [...labels],
          datasets: [
            {
              data
            }
          ]
        };
      })
    );
  }
}
