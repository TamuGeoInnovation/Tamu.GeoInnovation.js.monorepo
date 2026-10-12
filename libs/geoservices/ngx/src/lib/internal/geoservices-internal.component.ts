import { Component } from '@angular/core';
import { DrawerComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'tamu-gisc-internal',
  templateUrl: './geoservices-internal.component.html',
  styleUrls: ['./geoservices-internal.component.scss'],
  imports: [DrawerComponent, RouterLinkActive, RouterLink, RouterOutlet]
})
export class InternalComponent {}
