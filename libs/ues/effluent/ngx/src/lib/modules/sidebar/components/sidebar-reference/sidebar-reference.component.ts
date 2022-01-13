import { Component } from '@angular/core';

import { SidebarReferenceComponent as AggiemapSidebarReferenceComponent } from '@tamu-gisc/aggiemap/ngx/ui/desktop';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-reference',
  templateUrl: './sidebar-reference.component.html',
  styleUrls: ['./sidebar-reference.component.scss']
})
export class SidebarReferenceComponent<T extends esri.Graphic> extends AggiemapSidebarReferenceComponent<T> {}
