import { Component, OnInit } from '@angular/core';
import { RolesService } from '@tamu-gisc/oidc/admin-data-access';
import { Role } from '@tamu-gisc/oidc/provider-nest';
import { Observable } from 'rxjs';

@Component({
  selector: 'edit-role',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss']
})
export class EditRoleComponent implements OnInit {
  public $roles: Observable<Array<Partial<Role>>>;

  constructor(private readonly rolesService: RolesService) {
    this.$roles = this.rolesService.getRolesAll();
  }

  ngOnInit(): void {}

  deleteRole(role: Role) {
    console.log('deleteRole', role);
  }
}
