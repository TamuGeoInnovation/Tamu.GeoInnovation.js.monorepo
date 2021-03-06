import { Component, OnInit } from '@angular/core';

import { shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { RolesService } from '@tamu-gisc/oidc/admin-data-access';
import { Role } from '@tamu-gisc/oidc/common';

@Component({
  selector: 'edit-role',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss']
})
export class EditRoleComponent implements OnInit {
  public $roles: Observable<Array<Partial<Role>>>;

  constructor(private readonly rolesService: RolesService) {}

  public ngOnInit(): void {
    this.fetchRoles();
  }

  public deleteRole(role: Role) {
    console.log('deleteRole', role);
    this.rolesService.deleteRole(role).subscribe((deleteStatus) => {
      console.log('Deleted ', role.guid);
      this.fetchRoles();
    });
  }

  public fetchRoles() {
    this.$roles = this.rolesService.getRoles().pipe(shareReplay(1));
  }
}
