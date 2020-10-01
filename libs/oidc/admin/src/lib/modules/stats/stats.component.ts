import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { IChartConfiguration } from '@tamu-gisc/charts';
import { Chart } from 'chart.js';

@Component({
  selector: 'stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  public chartData: Observable<Array<IChartConfiguration>>;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {}
}
