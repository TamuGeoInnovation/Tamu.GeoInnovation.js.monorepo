import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { RolesService } from '@tamu-gisc/oidc/admin/data-access';
import { Role } from '@tamu-gisc/oidc/common';

@Component({
  selector: 'view',
  templateUrl: './view-role.component.html',
  styleUrls: ['./view-role.component.scss']
})
export class ViewRoleComponent implements OnInit {
  public $roles: Observable<Array<Partial<Role>>>;

  constructor(private readonly rolesService: RolesService) {
    this.$roles = this.rolesService.getRoles();
  }

  public ngOnInit(): void {}
}
