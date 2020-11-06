import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit {
  constructor(private titleService: Title) {
    this.titleService.setTitle('People | TxGIS Day 2020');
  }

  public ngOnInit(): void {}
}
