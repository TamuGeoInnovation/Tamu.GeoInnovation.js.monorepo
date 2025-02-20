import { Component, OnInit } from '@angular/core';
import { Observable, ReplaySubject, Subject, map, startWith, switchMap } from 'rxjs';

import {
  CategoryEntry,
  CategoryService,
  CmsResponse,
  LocationEntry,
  LocationService
} from '@tamu-gisc/aggiemap/ngx/data-access';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {
  public parent: ReplaySubject<CategoryEntry> = new ReplaySubject(1);
  public levelText: Observable<string> = new Subject();

  public categories: Observable<CmsResponse<CategoryEntry>>;
  public locations: Observable<CmsResponse<LocationEntry>>;
  public assetsUrl: string;

  constructor(private readonly cs: CategoryService, private readonly ls: LocationService, private env: EnvironmentService) {}

  public ngOnInit(): void {
    this.assetsUrl = this.env.value('Connections').cms_base;

    this.categories = this.parent.pipe(
      startWith(0),
      switchMap((parent) => {
        if (parent === 0) {
          return this.cs.getCategories();
        } else {
          return this.cs.getCategories((parent as CategoryEntry).attributes.catId);
        }
      })
    );

    this.locations = this.parent.pipe(
      startWith(0),
      switchMap((parent) => {
        if (parent === 0) {
          return this.ls.getLocations();
        } else {
          return this.ls.getLocations((parent as CategoryEntry).attributes.catId);
        }
      })
    );

    this.levelText = this.parent.pipe(
      startWith(0),
      map((parent) => {
        if (parent === 0) {
          return 'Main';
        } else {
          return (parent as CategoryEntry).attributes.name;
        }
      })
    );
  }

  public setParent(parent: CategoryEntry) {
    // Toggles do not have render-able children, so we don't want to drill down to the next level
    if (parent.attributes.type !== 'toggle') {
      this.parent.next(parent);
    }
  }
}
