import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Admin | TxGIS Day 2020');
  }

  public ngOnInit(): void {}
}
