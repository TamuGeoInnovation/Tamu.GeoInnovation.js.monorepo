import { Component, OnInit } from '@angular/core';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { Subject } from 'rxjs';

@Component({
  selector: 'tamu-gisc-covid-ngx',
  templateUrl: './covid-ngx.component.html',
  styleUrls: ['./covid-ngx.component.scss']
})
export class CovidNgxComponent implements OnInit {
  public mobileNavToggle = new Subject();

  constructor(public rp: ResponsiveService) {}

  public ngOnInit() {}
}
