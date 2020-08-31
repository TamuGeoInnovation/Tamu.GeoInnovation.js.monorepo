import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import {
  UsersService,
  ClientMetadataService,
  RolesService,
  IClientMetadataResponse
} from '@tamu-gisc/oidc/admin-data-access';
import { SecretQuestion, User, ClientMetadata, Role, UserRole } from '@tamu-gisc/oidc/provider-nest';

@Component({
  selector: 'detail-user',
  templateUrl: './detail-user.component.html',
  styleUrls: ['./detail-user.component.scss']
})
export class DetailUserComponent implements OnInit, OnDestroy {
  public userGuid: string;
  public user: Partial<User>;
  public accountForm: FormGroup;
  public rolesForm: FormArray;
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
      last_used_ip_address: ['']
    });
    this.accountForm = this.fb.group({
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
    });

    this.rolesForm = this.fb.array([]);

    this.$roles = this.roleService.getRoles();
    this.$clients = this.clientMetadataService.getClientMetadatas();

    if (this.route.snapshot.params.userGuid) {
      this.userGuid = this.route.snapshot.params.userGuid;
      this.userService.getUser(this.userGuid).subscribe((user) => {
        this.user = user;
        this.userForm.patchValue(this.user);
        this.accountForm.patchValue(this.user.account);
        // this.user.userRoles.forEach((userRole, index) => {
        //   const group = this.fb.group({
        //     client: userRole.client.guid,
        //     role: userRole.guid
        //   });
        //   this.rolesForm.insert(index, group);
        // });
        this.rolesForm.patchValue(user.userRoles);
        this.userForm.valueChanges
          .pipe(
            debounceTime(1000),
            takeUntil(this._$destroy)
          )
          .subscribe((res) => {
            console.log('User', this.userForm.getRawValue());
            const updatedUser: Partial<User> = {
              ...this.userForm.getRawValue(),
              account: {
                ...this.accountForm.getRawValue()
              }
            };
            // console.log(updatedUser);
            this.userService.updateUser(updatedUser).subscribe((result) => [console.log('Updated details')]);
          });
        this.accountForm.valueChanges
          .pipe(
            debounceTime(1000),
            takeUntil(this._$destroy)
          )
          .subscribe((res) => {
            console.log('Account', this.accountForm.getRawValue());
            const updatedUser: Partial<User> = {
              ...this.userForm.getRawValue(),
              account: {
                ...this.accountForm.getRawValue()
              }
            };
            // console.log(updatedUser);
            this.userService.updateUser(updatedUser).subscribe((result) => [console.log('Updated details')]);
          });
        this.rolesForm.valueChanges
          .pipe(
            debounceTime(1000),
            takeUntil(this._$destroy)
          )
          .subscribe((res) => {
            console.log('Role', this.rolesForm.getRawValue());
            // const role: Partial<Role> = {
            //   ...this.rolesForm.getRawValue()
            // };
            debugger;
          });
      });
    }
  }
}
