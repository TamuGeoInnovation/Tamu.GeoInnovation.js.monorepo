import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { IChartConfiguration } from '@tamu-gisc/charts';

import { SamplingLocationsService } from '../../services/sampling-locations.service';

@Component({
  selector: 'tamu-gisc-site-history-chart',
  templateUrl: './site-history-chart.component.html',
  styleUrls: ['./site-history-chart.component.scss']
})
export class SiteHistoryChartComponent implements OnInit {
  public chartSource: Observable<unknown>;

  @Input()
  public tier: number;

  @Input()
  public sample: number;

  public chartOptions: Partial<IChartConfiguration['options']> = {
    scales: {
      xAxes: [
        {
          type: 'time',
          distribution: 'series',
          time: {
            unit: 'day'
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

  constructor(private locationsService: SamplingLocationsService) {}

  public ngOnInit(): void {
    this.chartSource = this.locationsService.getChartDataForSample(this.tier, this.sample);
  }
}
