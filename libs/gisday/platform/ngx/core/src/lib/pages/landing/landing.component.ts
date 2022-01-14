import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'tamu-gisc-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  private title = 'TxGIS Day 2021';
  private rightNow: Date;
  private firstDay: Date;
  public timeTill: Date = new Date();
  public subscription: Subscription;
  private source = interval(1000);

  constructor(private titleService: Title) {}

  public ngOnInit() {
    this.titleService.setTitle(this.title);

    this.rightNow = new Date(Date.now());
    this.firstDay = new Date(2021, 11, 15, 14, 30, 0, 0);

    this.loadCountdown();
  }

  public loadCountdown() {
    this.subscription = this.source.subscribe(() => {
      this.rightNow = new Date(Date.now());
      this.timeTill = new Date(this.firstDay.getTime() - this.rightNow.getTime());
    });
  }
}
