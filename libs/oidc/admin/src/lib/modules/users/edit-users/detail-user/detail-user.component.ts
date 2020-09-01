import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, forkJoin } from 'rxjs';
import { debounceTime, takeUntil, shareReplay } from 'rxjs/operators';

import {
  UsersService,
  ClientMetadataService,
  RolesService,
  IClientMetadataResponse
} from '@tamu-gisc/oidc/admin-data-access';
import { User, ClientMetadata, Role, UserRole } from '@tamu-gisc/oidc/provider-nest';

@Component({
  selector: 'detail-user',
  templateUrl: './detail-user.component.html',
  styleUrls: ['./detail-user.component.scss']
})
export class DetailUserComponent implements OnInit, OnDestroy {
  public userGuid: string;
  public $user: Observable<Partial<User>>;
  public roleForm: FormGroup;
  public userForm: FormGroup;
  public $clients: Observable<Array<Partial<IClientMetadataResponse>>>;
  public $roles: Observable<Array<Partial<Role>>>;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UsersService,
    private clientMetadataService: ClientMetadataService,
    private roleService: RolesService
  ) {}

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public ngOnInit() {
    this.userGuid = this.route.snapshot.params.userGuid;

    this.userForm = this.fb.group({
      guid: [''],
      email: [''],
      email_verified: [''],
      enabled2fa: [''],
      recovery_email: [''],
      recovery_email_verified: [''],
      added: [''],
      updatedAt: [''],
      signup_ip_address: [''],
      last_used_ip_address: [''],
      account: this.fb.group({
        given_name: [''],
        family_name: [''],
        nickname: [''],
        profile: [''],
        picture: [''],
        website: [''],
        email: [''],
        gender: [''],
        birthdate: [''],
        zoneinfo: [''],
        locale: [''],
        phone_number: [''],
        phone_number_verified: [''],
        updated_at: [''],
        added: [''],
        street_address: [''],
        locality: [''],
        region: [''],
        postal_code: [''],
        country: ['']
      })
    });

    this.roleForm = this.fb.group({});

    this.$roles = this.roleService.getRoles().pipe(shareReplay(1));
    this.$clients = this.clientMetadataService.getClientMetadatas();
    this.$user = this.userService.getUser(this.userGuid).pipe(shareReplay(1));

    forkJoin([this.$clients, this.$user]).subscribe(([clients, user]) => {
      clients.forEach((client) => {
        const value = user.userRoles.find((role) => {
          return role.client.guid === client.guid;
        });

        this.roleForm.addControl(
          `${client.clientName}`,
          this.fb.control(value !== undefined ? value.role.guid : 'undefined')
        );
      });
    });

    if (this.route.snapshot.params.userGuid) {
      this.$user.subscribe((user) => {
        this.userForm.patchValue({
          ...user
        });
        this.userForm.valueChanges
          .pipe(
            debounceTime(1000),
            takeUntil(this._$destroy)
          )
          .subscribe((res) => {
            console.log('User', this.userForm.getRawValue());
            const updatedUser: Partial<User> = {
              ...this.userForm.getRawValue()
            };
            // console.log(updatedUser);
            this.userService.updateUser(updatedUser).subscribe((result) => [console.log('Updated details')]);
          });

        this.roleForm.valueChanges
          .pipe(
            debounceTime(1000),
            takeUntil(this._$destroy)
          )
          .subscribe((res) => {
            console.log('Role', this.roleForm.getRawValue());
            // const role: Partial<Role> = {
            //   ...this.rolesForm.getRawValue()
            // };
            debugger;
          });
      });
    }
  }
}
