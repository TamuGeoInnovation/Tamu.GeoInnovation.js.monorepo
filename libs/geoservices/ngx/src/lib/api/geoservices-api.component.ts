import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';

@Component({
  selector: 'tamu-gisc-api',
  templateUrl: './geoservices-api.component.html',
  styleUrls: ['./geoservices-api.component.scss']
})
export class GeoservicesApiComponent implements OnInit {
  public mobile: Observable<boolean>;
  public mobileNavToggle: Subject<boolean> = new Subject();

  constructor(private readonly rs: ResponsiveService) {}
  public ngOnInit(): void {
    this.mobile = this.rs.isMobile;
  }
}
