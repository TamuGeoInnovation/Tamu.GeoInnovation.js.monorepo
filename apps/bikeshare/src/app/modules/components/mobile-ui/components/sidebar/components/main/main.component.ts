import { Component, OnInit } from '@angular/core';

interface MenuItem {
  name: string;
  type: 'link-internal' | 'link-external' | 'router-path' | 'outlet';
  path: string;
  url?: string;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainMobileSidebarComponent implements OnInit {
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
      name: 'Building Directory',
      type: 'router-path',
      path: '../../../../../directory'
    },
    {
      name: 'Feedback',
      type: 'link-internal',
      path: '',
      url: './feedback'
    },
    {
      name: 'About',
      type: 'router-path',
      path: '../../../../../about'
    },
    {
      name: 'Site Policies',
      type: 'link-external',
      path: '',
      url: 'https://www.tamu.edu/statements/index.html'
    },
    {
      name: 'Accessibility Policy',
      type: 'link-external',
      path: '',
      url: 'http://itaccessibility.tamu.edu/'
    },
    {
      name: 'Privacy & Security',
      type: 'router-path',
      path: '../../../../../privacy'
    },
    {
      name: 'Changelog',
      type: 'router-path',
      path: '../../../../../changelog'
    }
  ];

  constructor() {}

  public ngOnInit() {}
}
