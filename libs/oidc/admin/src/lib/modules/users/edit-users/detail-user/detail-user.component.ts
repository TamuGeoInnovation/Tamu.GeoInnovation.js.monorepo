import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { UsersService } from '@tamu-gisc/oidc/admin-data-access';
import { SecretQuestion, User } from '@tamu-gisc/oidc/provider-nest';

@Component({
  selector: 'detail-user',
  templateUrl: './detail-user.component.html',
  styleUrls: ['./detail-user.component.scss']
})
export class DetailUserComponent implements OnInit {
  public userGuid: string;
  public user: Partial<User>;
  public account: FormGroup;
  public roles: FormGroup;
  public userForm: FormGroup;
  public $questions: Observable<Array<Partial<SecretQuestion>>>;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private userService: UsersService) {}

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
    this.account = this.fb.group({
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

    this.roles = this.fb.group({});

    // if (this.route.snapshot.params.userGuid) {
    //   this.userGuid = this.route.snapshot.params.roleGuid;
    //   this.userService.getUser(this.userGuid).subscribe((role) => {
    //     this.user = role;
    //     this.password.patchValue(this.user);
    //     this.password.valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
    //       this.userService.updateUser(this.password.getRawValue()).subscribe((result) => [console.log('Updated details')]);
    //     });
    //   });
    // }
  }
}
