import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { UserRoleService } from '@tamu-gisc/oidc/admin/data-access';
import { ISimplifiedUserRoleResponse } from '@tamu-gisc/oidc/common';

@Component({
  selector: 'tamu-gisc-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  public $userRoles: Observable<Array<Partial<ISimplifiedUserRoleResponse>>>;

  constructor(private readonly userRoleService: UserRoleService) {}

  public ngOnInit() {
    this.$userRoles = this.userRoleService.getAllUserRoles();
  }
}

