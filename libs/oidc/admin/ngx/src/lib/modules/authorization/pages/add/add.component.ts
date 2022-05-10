import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { map, mergeMap, Observable, toArray } from 'rxjs';

import { Role, User } from '@tamu-gisc/oidc/common';
import { ClientService, RolesService, UsersService } from '@tamu-gisc/oidc/admin/data-access';

import { IClientData } from '../../../clients/pages/view-client/view-client.component';

@Component({
  selector: 'tamu-gisc-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  public form: FormGroup;

  public $clients: Observable<Array<Partial<IClientData>>>;
  public $roles: Observable<Array<Partial<Role>>>;
  public $users: Observable<Array<Partial<User>>>;

  constructor(
    private readonly clientService: ClientService,
    private readonly roleService: RolesService,
    private readonly userService: UsersService
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
  }

  public submit() {
    console.log('Submitting...', this.form.getRawValue());
  }
}

