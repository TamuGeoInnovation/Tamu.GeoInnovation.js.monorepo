import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-wayback',
  templateUrl: './wayback.component.html',
  styleUrls: ['./wayback.component.scss']
})
export class WaybackComponent implements OnInit {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Wayback | TxGIS Day 2020');
  }

  public ngOnInit(): void {}
}
