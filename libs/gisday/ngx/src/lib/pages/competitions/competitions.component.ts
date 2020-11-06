import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-competitions',
  templateUrl: './competitions.component.html',
  styleUrls: ['./competitions.component.scss']
})
export class CompetitionsComponent implements OnInit {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Competitions | TxGIS Day 2020');
  }

  public ngOnInit(): void {}
}
