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
import { User, ClientMetadata, Role, UserRole, INewRole } from '@tamu-gisc/oidc/provider-nest';

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
      guid: new FormControl({ value: '', disabled: true }),
      email: new FormControl({ value: '' }),
      email_verified: new FormControl({ value: '', disabled: true }),
      enabled2fa: new FormControl({ value: '' }),
      recovery_email: new FormControl({ value: '' }),
      recovery_email_verified: new FormControl({ value: '', disabled: true }),
      added: new FormControl({ value: '', disabled: true }),
      updatedAt: new FormControl({ value: '', disabled: true }),
      signup_ip_address: new FormControl({ value: '', disabled: true }),
      last_used_ip_address: new FormControl({ value: '', disabled: true }),
      account: this.fb.group({
        given_name: new FormControl({ value: '' }),
        family_name: new FormControl({ value: '' }),
        nickname: new FormControl({ value: '' }),
        profile: new FormControl({ value: '' }),
        picture: new FormControl({ value: '' }),
        website: new FormControl({ value: '' }),
        email: new FormControl({ value: '' }),
        gender: new FormControl({ value: '' }),
        birthdate: new FormControl({ value: '' }),
        zoneinfo: new FormControl({ value: '' }),
        locale: new FormControl({ value: '' }),
        phone_number: new FormControl({ value: '' }),
        phone_number_verified: new FormControl({ value: '', disabled: true }),
        updated_at: new FormControl({ value: '', disabled: true }),
        added: new FormControl({ value: '', disabled: true }),
        street_address: new FormControl({ value: '' }),
        locality: new FormControl({ value: '' }),
        region: new FormControl({ value: '' }),
        postal_code: new FormControl({ value: '' }),
        country: new FormControl({ value: '' })
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
        this.roleForm.addControl('userGuid', this.fb.control(user.guid));
        this.roleForm.addControl(`${client.guid}`, this.fb.control(value !== undefined ? value.role.guid : 'undefined'));
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
          .subscribe(() => {
            const val = this.roleForm.getRawValue();
            const newRoles: INewRole[] = [];

            const valKeys = Object.keys(val);
            const len = valKeys.length;
            for (var i = 0; i < len; i++) {
              const key = valKeys[i];
              if (key !== 'userGuid') {
                const newRole: INewRole = {
                  userGuid: val['userGuid'],
                  clientGuid: key,
                  roleGuid: val[key]
                };
                newRoles.push(newRole);
              }
            }
            this.userService.updateRoles(newRoles).subscribe((result) => [console.log('Updated user roles')]);
          });
      });
    }
  }
}
