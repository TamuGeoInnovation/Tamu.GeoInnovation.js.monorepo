import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'tamu-gisc-highschool',
    templateUrl: './highschool.component.html',
    styleUrls: ['./highschool.component.scss'],
    standalone: false
})
export class HighschoolComponent implements OnInit {
  constructor(private titleService: Title) {}

  public ngOnInit(): void {
    this.titleService.setTitle('High School | TxGIS Day');
  }
}
