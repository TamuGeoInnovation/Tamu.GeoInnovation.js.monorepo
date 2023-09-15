import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from '@auth0/auth0-angular';

import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'tamu-gisc-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  private title = 'TxGIS Day 2022';
  private rightNow: Date;
  private firstDay: Date;
  public timeTill: Date = new Date();
  public daysTill: string;
  public subscription: Subscription;
  public user$: any;
  private source = interval(1000);

  constructor(private titleService: Title, private readonly as: AuthService) {}

  public ngOnInit() {
    this.titleService.setTitle(this.title);

    this.user$ = this.as.user$;

    this.rightNow = new Date(Date.now());
    this.firstDay = new Date(2022, 10, 13, 14, 30, 0, 0); // Idk why but we have to take a month and a day off for the numbers to add up - Aaron H (3/26/22)

    this.loadCountdown();
  }

  public loadCountdown() {
    this.subscription = this.source.subscribe(() => {
      this.rightNow = new Date(Date.now());
      this.timeTill = new Date(this.firstDay.getTime() - this.rightNow.getTime());
      const milliseconds = this.firstDay.getTime() - this.rightNow.getTime();
      this.daysTill = (milliseconds / 1000 / 86400).toFixed(0); // Converts from milliseconds to seconds to days (86400 seconds in a day)
    });
  }
}

