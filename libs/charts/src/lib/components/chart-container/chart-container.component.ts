import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import Chart from 'chart.js';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-chart-container',
  templateUrl: './chart-container.component.html',
  styleUrls: ['./chart-container.component.scss']
})
export class ChartContainerComponent implements OnDestroy {
  @ViewChild('chartContainer', { static: true })
  public container: ElementRef;

  private _chart: Chart;
  private _$destroy: Subject<boolean> = new Subject();

  constructor() {}

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public create(config?: Observable<ChartConfiguration> | ChartConfiguration) {
    if (config && config instanceof Observable) {
      // Handle observable data sources
      config.pipe(takeUntil(this._$destroy)).subscribe((c) => {
        if (this._chart === undefined) {
          this._chart = new Chart((<HTMLCanvasElement>this.container.nativeElement).getContext('2d'), c);
        } else {
          this._chart.config.type = c.type;
          this._chart.config.data = c.data;

          this._chart.update();
        }
      });
    }
    
    // // if chart instance, update data
    // if (this._chart) {
    //   debugger;
    // } else {
    //   // If no chart instance, create
    //   this._chart = new Chart((<HTMLCanvasElement>this.container.nativeElement).getContext('2d'), {
    //     type: 'bar',
    //     data: {
    //       labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    //       datasets: [
    //         {
    //           label: '# of Votes',
    //           data: [12, 19, 3, 5, 2, 3],
    //           backgroundColor: [
    //             'rgba(255, 99, 132, 0.2)',
    //             'rgba(54, 162, 235, 0.2)',
    //             'rgba(255, 206, 86, 0.2)',
    //             'rgba(75, 192, 192, 0.2)',
    //             'rgba(153, 102, 255, 0.2)',
    //             'rgba(255, 159, 64, 0.2)'
    //           ],
    //           borderColor: [
    //             'rgba(255, 99, 132, 1)',
    //             'rgba(54, 162, 235, 1)',
    //             'rgba(255, 206, 86, 1)',
    //             'rgba(75, 192, 192, 1)',
    //             'rgba(153, 102, 255, 1)',
    //             'rgba(255, 159, 64, 1)'
    //           ],
    //           borderWidth: 1
    //         }
    //       ]
    //     },
    //     options: {
    //       scales: {
    //         yAxes: [
    //           {
    //             ticks: {
    //               beginAtZero: true
    //             }
    //           }
    //         ]
    //       }
    //     }
    //   });
    // }
  }
}

export class ChartConfiguration {
  public type: IChartConfiguration['type'];

  public data: IChartConfiguration['data'];

  public options: IChartConfiguration['options'];

  constructor(args?: IChartConfiguration) {
    if (args && args.data) {
      this.data = args.data;
    }

    this.options = {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    };
  }

  public updateData(data: IChartConfiguration['data']) {
    this.data = data;
  }
}

export class BarChartConfiguration extends ChartConfiguration {
  constructor(args?: IChartConfiguration) {
    super(args);

    this.type = 'bar';
  }
}

export class LineChartConfiguration extends ChartConfiguration {
  constructor(args: IChartConfiguration) {
    super(args);

    this.type = 'line';
  }
}

export interface IChartConfiguration {
  // type?: 'line' | 'bar' | 'radar' | 'pie' | 'doughnut' | 'polarArea' | 'bubble' | 'scatter';
  type?: string;

  data?: {
    labels?: Array<any>;
    datasets?: {
      label: string;
      data: Array<any>;
      backgroundColor?: Array<string>;
      borderColor?: Array<string>;
      borderWidth?: number;
    }[];
  };

  options?: any;
}
