import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Admin | TxGIS Day 2022');
  }
}
