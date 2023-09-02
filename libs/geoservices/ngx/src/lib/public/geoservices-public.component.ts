import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { growAnimationBuilder } from '@tamu-gisc/ui-kits/ngx/animations';

@Component({
  selector: 'tamu-gisc-geoservices-public',
  templateUrl: './geoservices-public.component.html',
  styleUrls: ['./geoservices-public.component.scss'],
  animations: [growAnimationBuilder(250)]
})
export class GeoservicesPublicComponent implements OnInit {
  public mobileNavToggle: Subject<boolean> = new Subject();

  public url: string;

  constructor(public rp: ResponsiveService, private readonly env: EnvironmentService) {}

  public ngOnInit() {
    this.url = this.env.value('accounts_url');
  }
}
