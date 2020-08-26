import { Component, OnInit } from '@angular/core';

import { SidebarReferenceComponent as AggiemapSidebarReferenceComponent } from '@tamu-gisc/aggiemap';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-reference',
  templateUrl: './sidebar-reference.component.html',
  styleUrls: ['./sidebar-reference.component.scss']
})
export class SidebarReferenceComponent<T extends esri.Graphic> extends AggiemapSidebarReferenceComponent<T> {}
