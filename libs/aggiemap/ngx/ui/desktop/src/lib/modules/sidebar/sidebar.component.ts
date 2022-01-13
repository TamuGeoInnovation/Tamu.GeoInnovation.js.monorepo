import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

@Component({
  selector: 'tamu-gisc-aggiemap-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class AggiemapSidebarComponent implements OnInit {
  public isDev: Observable<boolean>;

  constructor(private devTools: TestingService) {}

  public ngOnInit() {
    this.isDev = this.devTools.get('isTesting');
  }
}
