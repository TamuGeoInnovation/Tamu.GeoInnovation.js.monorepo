import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';

import { IChartConfiguration } from '@tamu-gisc/charts';
import { StatusService } from '@tamu-gisc/two/data-access';

@Component({
  selector: 'site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss']
})
export class SiteComponent implements OnInit {
  public siteCode: string;
  public chartData: Observable<Array<IChartConfiguration>>;
  private history = 2;

  constructor(private route: ActivatedRoute, private statusService: StatusService) {}

  public ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.siteCode = params.get('siteCode');
    });
    if (this.siteCode === 'demo') {
      this.chartData = this.statusService.demoSiteHistory();
    } else {
      this.chartData = this.statusService.siteHistory(this.siteCode, this.history);
    }
  }
}
