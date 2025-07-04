import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-geoservices-admin',
  templateUrl: './geoservices-admin.component.html',
  styleUrls: ['./geoservices-admin.component.scss']
})
export class GeoservicesAdminComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Admin | TAMU Geoservices');
  }
}
