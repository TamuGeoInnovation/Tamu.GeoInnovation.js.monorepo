import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-sponsors',
  templateUrl: './sponsors.component.html',
  styleUrls: ['./sponsors.component.scss']
})
export class SponsorsComponent implements OnInit {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Sponsors | TxGIS Day 2022');
  }

  public ngOnInit(): void {}
}
