import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Category, CategoryService, CmsResponse } from '@tamu-gisc/aggiemap/ngx/data-access';

@Component({
  selector: 'tamu-gisc-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {
  public categories: Observable<CmsResponse<Category>>;

  constructor(private readonly cs: CategoryService) {}

  public ngOnInit(): void {
    this.categories = this.cs.getCategories();
  }
}

