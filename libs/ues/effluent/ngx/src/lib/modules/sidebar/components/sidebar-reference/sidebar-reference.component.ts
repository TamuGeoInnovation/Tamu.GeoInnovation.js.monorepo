import { Component } from '@angular/core';

import { SidebarReferenceComponent as AggiemapSidebarReferenceComponent } from '@tamu-gisc/aggiemap/ngx/ui/desktop';


@Component({
  selector: 'tamu-gisc-sidebar-reference',
  templateUrl: './sidebar-reference.component.html',
  styleUrls: ['./sidebar-reference.component.scss']
})
export class SidebarReferenceComponent<T extends __esri.Graphic> extends AggiemapSidebarReferenceComponent<T> {}
