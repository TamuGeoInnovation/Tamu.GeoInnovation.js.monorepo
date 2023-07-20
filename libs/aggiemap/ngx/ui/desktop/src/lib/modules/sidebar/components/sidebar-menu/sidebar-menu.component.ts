import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, map, of, shareReplay, switchMap, withLatestFrom } from 'rxjs';

import { CategoryEntry, CategoryService, CmsResponse, LocationEntry } from '@tamu-gisc/aggiemap/ngx/data-access';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { CategoryLocationMenuService } from '../../services/category-location-menu/category-location-menu.service';

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
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private env: EnvironmentService,
    private readonly cs: CategoryService,
    private readonly ss: CategoryLocationMenuService
  ) {}

  public ngOnInit(): void {
    this.assetsUrl = this.env.value('Connections').cms_base;

    this.parentId = this.route.queryParams.pipe(
      map((params) => {
        if (params.id) {
          return parseInt(params.id);
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
          return this.cs.getCategory(id).pipe(
            map((res) => res.data[0]),
            shareReplay()
          );
        }
      }),
      shareReplay()
    );

    this.categories = this.parentId.pipe(this.ss.getCategories());

    this.locations = this.parentId.pipe(this.ss.getLocations());

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

  public setParent(event: MouseEvent, parent: CategoryEntry) {
    // Ignore clicks on input elements (checkboxes)
    if (event.target['tagName'] === 'INPUT') {
      return;
    }

    // Toggles do not have render-able children, so we don't want to drill down to the next level
    if (parent.attributes.type !== 'toggle') {
      this._navigateToLocation(parent.attributes.catId);
    }
  }

  public setParentId() {
    of(true)
      .pipe(withLatestFrom(this.parent)) // I don't understand why I need to get latest from and not just use the parent observable since it's already multicast
      .subscribe(([, parent]) => {
        if (parent) {
          this._navigateToLocation(parent.attributes.parent);
        }
      });
  }

  private _navigateToLocation(id: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id },
      queryParamsHandling: 'merge'
    });
  }

  public toggleLocation(location: LocationEntry) {
    of(true)
      .pipe(
        // this.parent SHOULD be the correct category when the toggle is clicked.
        // this.parent will not be correct when we do entire category toggles with sub-categories
        withLatestFrom(this.parent),
        switchMap(([, parent]) => {
          if (parent.attributes.catId === location.attributes.catId) {
            return of(parent);
          }
        })
      )
      .subscribe((res) => {
        this.ss.toggleLocation(location, res);
      });
  }

  public toggleCategory(category: CategoryEntry) {
    this.ss.toggleCategory(category);
  }
}
