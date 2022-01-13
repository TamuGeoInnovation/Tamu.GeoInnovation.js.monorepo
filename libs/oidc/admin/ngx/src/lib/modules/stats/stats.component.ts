import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';

import { IChartConfiguration } from '@tamu-gisc/ui-kits/ngx/charts';
import { StatsService } from '@tamu-gisc/oidc/admin/data-access';

@Component({
  selector: 'stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  public $countOfLoggedInUsers: Observable<number>;
  public $countOfUsersByClient: Observable<Array<IChartConfiguration>>;
  public $countOfNewUsers: Observable<Array<IChartConfiguration>>;
  public $totalLoginsPastMonth: Observable<Array<IChartConfiguration>>;

  constructor(private route: ActivatedRoute, private statService: StatsService) {}

  public ngOnInit(): void {
    this.$countOfLoggedInUsers = this.statService.getCountOfLoggedInUsers();
    this.$countOfUsersByClient = this.statService.countOfUsersByClient();
    this.$countOfNewUsers = this.statService.countOfNewUsers();
    this.$totalLoginsPastMonth = this.statService.totalLoginsPastMonth();
  }
}
