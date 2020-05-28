import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { from, Observable, of, forkJoin, combineLatest } from 'rxjs';

import { IChartConfiguration } from '@tamu-gisc/charts';
import { StatusService, IDateHistory } from '@tamu-gisc/two/data-access';

@Component({
  selector: 'site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss']
})
export class SiteComponent implements OnInit {
  public siteCode: string;
  public chartData: Observable<Array<IChartConfiguration>>;
  private history = 5;
  public chartConfiguration: IChartConfiguration = {
    data: {
      datasets: [
        {
          data: [44, 4]
        }
      ],
      labels: ['Successes', 'Failures']
    },
    options: {
      cutoutPercentage: 50,
      title: {
        text: 'May 11, 2020'
      }
    }
  };

  constructor(private route: ActivatedRoute, private statusService: StatusService) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.siteCode = params.get('siteCode');
    });

    this.statusService.siteHistory(this.siteCode, this.history).subscribe((result) => {
      console.log(result);
    })
  }
}
