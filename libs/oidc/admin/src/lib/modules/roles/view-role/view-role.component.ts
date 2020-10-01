import { Component, OnInit } from '@angular/core';
import { RolesService } from '@tamu-gisc/oidc/admin-data-access';
import { Role } from '@tamu-gisc/oidc/provider-nestjs';
import { Observable } from 'rxjs';

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
  ngOnInit(): void {}
}
