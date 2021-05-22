import { Component, OnInit } from '@angular/core';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { Subject } from 'rxjs';

@Component({
  selector: 'tamu-gisc-geoservices-covid',
  templateUrl: './geoservices-covid.component.html',
  styleUrls: ['./geoservices-covid.component.scss']
})
export class GeoservicesCovidComponent implements OnInit {
  public mobileNavToggle = new Subject();

  constructor(public rp: ResponsiveService) {}

  public ngOnInit() {}
}
