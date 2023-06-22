import { Component, OnInit } from '@angular/core';
import { Observable, Subject, map, of, shareReplay, switchMap } from 'rxjs';

import {
  CategoryEntry,
  CategoryService,
  CmsResponse,
  LocationEntry,
  LocationService
} from '@tamu-gisc/aggiemap/ngx/data-access';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'tamu-gisc-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {
  public parent: Observable<CategoryEntry>;
  public parentId: Observable<number>;
  public levelText: Observable<string> = new Subject();

  public categories: Observable<CmsResponse<CategoryEntry>>;
  public locations: Observable<CmsResponse<LocationEntry>>;
  public assetsUrl: string;

  constructor(
    private readonly cs: CategoryService,
    private readonly ls: LocationService,
    private env: EnvironmentService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.assetsUrl = this.env.value('Connections').cms_base;

    this.parentId = this.route.queryParams.pipe(
      map((params) => {
        if (params.parent) {
          return params.parent;
        } else {
          return 0;
        }
      }),
      shareReplay()
    );

    this.parent = this.parentId.pipe(
      switchMap((id) => {
        if (id === 0) {
          return of(null);
        } else {
          return this.cs.getCategory(id).pipe(map((res) => res.data[0]));
        }
      }),
      shareReplay()
    );

    this.categories = this.parentId.pipe(
      switchMap((id) => {
        if (id === 0) {
          return this.cs.getCategories();
        } else {
          return this.cs.getCategories(id);
        }
      })
    );

    this.locations = this.parentId.pipe(
      switchMap((id) => {
        if (id === 0) {
          return this.ls.getLocations();
        } else {
          return this.ls.getLocations(id);
        }
      })
    );

    this.levelText = this.parent.pipe(
      map((parent) => {
        if (!parent) {
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
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { parent: parent.attributes.catId },
        queryParamsHandling: 'merge'
      });
    }
  }
}
