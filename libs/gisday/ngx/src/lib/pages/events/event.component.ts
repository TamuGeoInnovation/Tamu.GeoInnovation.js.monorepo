import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Sessions | TxGIS Day 2020');
  }

  public ngOnInit() {}
}
