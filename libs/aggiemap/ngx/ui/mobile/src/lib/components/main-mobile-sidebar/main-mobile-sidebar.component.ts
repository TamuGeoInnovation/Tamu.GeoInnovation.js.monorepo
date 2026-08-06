import { Component } from '@angular/core';

import { Angulartics2 } from 'angulartics2';
import { v4 as guid } from 'uuid';

interface MenuItem {
  name: string;
  type: 'link-internal' | 'link-external' | 'router-path' | 'outlet' | 'separator';
  path: string;
  url?: string;
}

@Component({
  selector: 'tamu-gisc-main-mobile-sidebar',
  templateUrl: './main-mobile-sidebar.component.html',
  styleUrls: ['./main-mobile-sidebar.component.scss']
})
export class MainMobileSidebarComponent {
  public menu: MenuItem[] = [
    {
      name: 'Legend',
      type: 'outlet',
      path: 'legend'
    },
    {
      name: 'Layers',
      type: 'outlet',
      path: 'layers'
    },
    {
      name: 'Basemap',
      type: 'outlet',
      path: 'basemap'
    },
    {
      name: 'Bus Routes',
      type: 'router-path',
      path: '/map/m/bus'
    },
    { name: '', type: 'separator', path: '' },
    {
      name: 'All Maps',
      type: 'router-path',
      path: '/all-maps'
    },
    {
      name: 'About Aggie Map',
      type: 'router-path',
      path: '/about'
    },
    {
      name: 'Map Instructions',
      type: 'router-path',
      path: '/instructions'
    },
    {
      name: 'Building Directory',
      type: 'router-path',
      path: '/directory'
    },
    { name: '', type: 'separator', path: '' },
    {
      name: 'Request Maps & Changes',
      type: 'router-path',
      path: '/requesting-maps'
    },
    {
      name: 'Submit Feedback',
      type: 'link-internal',
      path: '',
      url: './feedback'
    },
    { name: '', type: 'separator', path: '' },
    {
      name: 'Accessibility Policy',
      type: 'link-external',
      path: '',
      url: 'http://itaccessibility.tamu.edu/'
    },
    {
      name: 'Privacy & Security Policy',
      type: 'link-external',
      path: '',
      url: 'https://www.tamu.edu/statements/privacy.html'
    },
    {
      name: 'Site Policies',
      type: 'link-external',
      path: '',
      url: 'https://www.tamu.edu/statements/index.html'
    },
    { name: '', type: 'separator', path: '' },
    {
      name: 'GitHub',
      type: 'link-external',
      path: '',
      url: 'https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo'
    },
    {
      name: 'Changelog',
      type: 'link-external',
      path: '',
      url: 'https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pulls?q=is%3Apr+is%3Aclosed'
    }
  ];

  constructor(private analytics: Angulartics2) {}

  public reportNavigation(name: string) {
    const label = {
      guid: guid(),
      date: Date.now(),
      name: name
    };

    this.analytics.eventTrack.next({
      action: 'sidebar_select',
      properties: {
        category: 'ui_interaction',
        gstCustom: label
      }
    });
  }
}
