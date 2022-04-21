import { Component } from '@angular/core';
import { Subject } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';

@Component({
  selector: 'tamu-gisc-covid-ngx',
  templateUrl: './covid-ngx.component.html',
  styleUrls: ['./covid-ngx.component.scss']
})
export class CovidNgxComponent {
  public mobileNavToggle = new Subject();

  constructor(public rp: ResponsiveService) {}
}
