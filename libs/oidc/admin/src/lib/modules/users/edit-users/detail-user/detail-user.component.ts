import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, forkJoin } from 'rxjs';
import { debounceTime, takeUntil, shareReplay, switchMap, skip, withLatestFrom } from 'rxjs/operators';

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

    // We're gonna initialize this after we have the clients and the user. We'll initialize the form group there
    // with all of the controls pre-prepared, so that it only emits once at most at the beginning.
    //
    // this.roleForm = this.fb.group({});

    this.$roles = this.roleService.getRoles().pipe(shareReplay(1));
    this.$clients = this.clientMetadataService.getClientMetadatas();
    this.$user = this.userService.getUser(this.userGuid).pipe(shareReplay(1));

    forkJoin([this.$clients, this.$user]).subscribe(([clients, user]) => {
      // Setup a scoped group, to which we'll append the roles to. Once all controls are added to this
      // scoped group, we'll initialize this.roleForm.
      const group = this.fb.group({
        userGuid: this.fb.control(user.guid)
      });

      clients.forEach((client) => {
        const value = user.userRoles.find((role) => {
          return role.client.guid === client.guid;
        });
        group.addControl(`${client.clientName}`, this.fb.control(value !== undefined ? value.role.guid : 'undefined'));
      });

      this.roleForm = group;

      this.registerRoleChanges();
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
      });
    }
  }

  private registerRoleChanges() {
    // We need to call this function separately because this.roleForm.valueChanges will be undefined
    // when its hit inside ngOninit, because clients and users are an async operation. Gotta make sure
    // it's not undefined.
    this.roleForm.valueChanges
      .pipe(
        debounceTime(1000),
        withLatestFrom(this.$clients),
        switchMap(([formValue, clients]) => {
          const formRoles = this.roleForm.getRawValue();

          const newRoles: INewRole[] = Object.entries(formRoles).reduce((acc, [key, value]) => {
            if (key !== 'userGuid') {
              const associatedClient = clients.find((r) => {
                return r.clientName === key;
              });

              const newRole: INewRole = {
                userGuid: formValue['userGuid'],
                clientGuid: associatedClient.guid,
                roleGuid: value as string
              };

              return [...acc, newRole];
            } else {
              return acc;
            }
          }, []);

          const requests = newRoles.map((newRole) => {
            return this.userService.updateRole(newRole);
          });

          return forkJoin(requests);
        }),
        takeUntil(this._$destroy)
      )
      .subscribe((result) => {
        // this.userService.updateRoles(newRoles).subscribe((result) => [console.log('Updated user roles')]);
        debugger;
      });
  }
}
