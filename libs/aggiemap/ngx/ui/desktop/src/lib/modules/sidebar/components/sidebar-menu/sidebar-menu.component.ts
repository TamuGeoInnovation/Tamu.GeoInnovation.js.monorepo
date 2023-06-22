import { Component, OnInit } from '@angular/core';
import { Observable, ReplaySubject, Subject, map, startWith, switchMap } from 'rxjs';

import { Category, CategoryService, CmsResponse } from '@tamu-gisc/aggiemap/ngx/data-access';

@Component({
  selector: 'tamu-gisc-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {
  public parent: ReplaySubject<Category> = new ReplaySubject(1);
  public levelText: Observable<string> = new Subject();

  public categories: Observable<CmsResponse<Category>>;

  constructor(private readonly cs: CategoryService) {}

  public ngOnInit(): void {
    this.categories = this.parent.pipe(
      startWith(0),
      switchMap((parent) => {
        if (parent === 0) {
          return this.cs.getCategories(parent);
        } else {
          return this.cs.getCategories((parent as Category).attributes.catId);
        }
      })
    );

    this.levelText = this.parent.pipe(
      startWith(0),
      map((parent) => {
        if (parent === 0) {
          return 'Main';
        } else {
          return (parent as Category).attributes.name;
        }
      })
    );
  }

  public setParent(parent: Category) {
    this.parent.next(parent);
  }
}
