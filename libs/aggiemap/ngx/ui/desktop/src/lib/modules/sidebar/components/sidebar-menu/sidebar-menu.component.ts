import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, map, of, shareReplay, switchMap, withLatestFrom, BehaviorSubject, tap, skip } from 'rxjs';

import {
  CategoryEntry,
  CategoryService,
  CmsDataEntity,
  CmsResponse,
  LocationEntry,
  LocationService
} from '@tamu-gisc/aggiemap/ngx/data-access';
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

  private _categoriesDictionary: BehaviorSubject<Dictionary> = new BehaviorSubject({});
  private _locationsDictionary: BehaviorSubject<Dictionary> = new BehaviorSubject({});

  constructor(
    private readonly cs: CategoryService,
    private readonly ls: LocationService,
    private env: EnvironmentService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
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

    this.categories = this.parentId.pipe(
      switchMap((id) => {
        if (id === 0) {
          return this.cs.getCategories();
        } else {
          return this.cs.getCategories(id);
        }
      }),
      tap((cats) => {
        this._updateDictionary(this._categoriesDictionary, cats, 'parent', 'catId');
      })
    );

    this.locations = this.parentId.pipe(
      switchMap((id) => {
        if (id === 0) {
          return this.ls.getLocations();
        } else {
          return this.ls.getLocations(id);
        }
      }),
      tap((locs) => {
        this._updateDictionary(this._locationsDictionary, locs, 'catId', 'mrkId');
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

    this._categoriesDictionary.pipe(skip(1)).subscribe((dict) => {
      console.log('Categories', dict);
    });

    this._locationsDictionary.pipe(skip(1)).subscribe((dict) => {
      console.log(`Locations`, dict);
    });
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

  private _updateDictionary(
    dictionary: BehaviorSubject<Dictionary>,
    entries: CmsResponse<any>,
    parentIdentifier: string,
    childIdentifier: string
  ) {
    of(true)
      .pipe(
        withLatestFrom(dictionary),
        map(([, dict]: [boolean, Dictionary]) => {
          if (entries.data.length === 0) {
            return dict;
          }

          // All categories should belong to the same parent
          const parentId = entries.data[0].attributes[parentIdentifier];
          const children = entries.data.map((cat) => cat.attributes[childIdentifier]);

          if (!dict[parentId]) {
            dict[parentId] = children;
          } else {
            // Concat and dedupe
            dict[parentId] = dict[parentId].concat(children).filter((item, pos, self) => {
              return self.indexOf(item) === pos;
            });
          }

          return dict;
        })
      )
      .subscribe((res) => {
        dictionary.next(res);
      });
  }
}

interface Dictionary {
  [key: number]: Array<number>;
}

