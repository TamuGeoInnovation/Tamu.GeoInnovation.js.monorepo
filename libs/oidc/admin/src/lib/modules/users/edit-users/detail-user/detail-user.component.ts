import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { UsersService } from '@tamu-gisc/oidc/admin-data-access';
import { User } from '@tamu-gisc/oidc/provider-nest';

@Component({
  selector: 'detail-user',
  templateUrl: './detail-user.component.html',
  styleUrls: ['./detail-user.component.scss']
})
export class DetailUserComponent implements OnInit {
  public userGuid: string;
  public user: Partial<User>;
  public form: FormGroup;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private userService: UsersService) {
    this.form = this.fb.group({
      guid: [''],
      name: [''],
      level: ['']
    });
  }

  public ngOnInit() {
    if (this.route.snapshot.params.userGuid) {
      this.userGuid = this.route.snapshot.params.roleGuid;
      this.userService.getUser(this.userGuid).subscribe((role) => {
        this.user = role;
        this.form.patchValue(this.user);
        this.form.valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
          this.userService.updateUser(this.form.getRawValue()).subscribe((result) => [console.log('Updated details')]);
        });
      });
    }
  }
}
