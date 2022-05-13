import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { filter, map, mergeMap, Observable, switchMap, tap, toArray } from 'rxjs';

import { IClientData, NewUserRole, Role, User } from '@tamu-gisc/oidc/common';
import { ClientService, RolesService, UserRoleService, UsersService } from '@tamu-gisc/oidc/admin/data-access';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'tamu-gisc-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  public form: FormGroup;
  public $userRole: Observable<Partial<NewUserRole>>;

  public $clients: Observable<Array<Partial<IClientData>>>;
  public $roles: Observable<Array<Partial<Role>>>;
  public $users: Observable<Array<Partial<User>>>;

  constructor(
    private route: ActivatedRoute,
    private readonly clientService: ClientService,
    private readonly roleService: RolesService,
    private readonly userService: UsersService,
    private readonly userRoleService: UserRoleService
  ) {}

  public ngOnInit() {
    this.form = new FormGroup({
      client: new FormControl(''),
      role: new FormControl(''),
      user: new FormControl('')
    });

    this.$clients = this.clientService.getEntities().pipe(
      mergeMap((clients) => clients),
      map((client) => {
        const clientData: IClientData = JSON.parse(client.data);

        return clientData;
      }),
      toArray()
    );

    this.$roles = this.roleService.getRoles();

    this.$users = this.userService.getUsers();

    this.route.params
      .pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.userRoleService.get(guid)),
        tap((userRole) => {
          this.form.controls.client.setValue(userRole.client.id);
          this.form.controls.role.setValue(userRole.role.guid);
          this.form.controls.user.setValue(userRole.user.guid);

          return userRole;
        })
      )
      .subscribe((userRole) => {
        console.log('UserRole: ', userRole);
      });
  }

  public submit() {
    const ent = {
      userGuid: this.form.controls.user.value,
      role_id: this.form.controls.role.value,
      client_id: this.form.controls.client.value
    };

    this.userRoleService.insert(ent).subscribe((result) => {
      console.log('Updated', result);
    });
  }
}

