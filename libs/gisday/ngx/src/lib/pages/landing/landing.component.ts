import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  private title = 'TxGIS Day 2021';

  constructor(private titleService: Title) {}

  public ngOnInit() {
    this.titleService.setTitle(this.title);

    this.loadCountdown();
  }

  public loadCountdown() {}
}
