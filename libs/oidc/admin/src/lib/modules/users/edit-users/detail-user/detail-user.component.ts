import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { UsersService } from '@tamu-gisc/oidc/admin-data-access';
import { SecretQuestion, User } from '@tamu-gisc/oidc/provider-nest';

@Component({
  selector: 'detail-user',
  templateUrl: './detail-user.component.html',
  styleUrls: ['./detail-user.component.scss']
})
export class DetailUserComponent implements OnInit, OnDestroy {
  public userGuid: string;
  public user: Partial<User>;
  public accountForm: FormGroup;
  public rolesForm: FormGroup;
  public userForm: FormGroup;
  public $questions: Observable<Array<Partial<SecretQuestion>>>;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private userService: UsersService) {}

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

    this.rolesForm = this.fb.group({});

    if (this.route.snapshot.params.userGuid) {
      this.userGuid = this.route.snapshot.params.userGuid;
      this.userService.getUser(this.userGuid).subscribe((user) => {
        this.user = user;
        this.userForm.patchValue(this.user);
        this.accountForm.patchValue(this.user.account);
        this.rolesForm.patchValue(this.user.userRoles);
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
      });
    }
  }
}
