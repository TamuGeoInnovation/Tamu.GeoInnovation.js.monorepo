import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';

@Component({
  selector: 'tamu-gisc-geoservices-public',
  templateUrl: './geoservices-public.component.html',
  styleUrls: ['./geoservices-public.component.scss']
})
export class GeoservicesPublicComponent implements OnInit {
  public mobileNavToggle = new Subject();

  constructor(public rp: ResponsiveService) {}

  public ngOnInit() {}
}
