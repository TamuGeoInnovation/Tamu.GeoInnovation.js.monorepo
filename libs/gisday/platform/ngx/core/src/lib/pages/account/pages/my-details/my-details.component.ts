import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';

import { UserInfoService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { UserInfo } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-my-details',
  templateUrl: './my-details.component.html',
  styleUrls: ['./my-details.component.scss']
})
export class MyDetailsComponent implements OnInit {
  public form: FormGroup;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private fb: FormBuilder, private ns: NotificationService, private readonly us: UserInfoService) {
    this.form = this.fb.group({
      uin: [''],
      fieldOfStudy: [''],
      classification: ['']
    });
  }

  public ngOnInit(): void {
    this.us.getSignedOnEntity().subscribe({
      next: (result) => {
        this.form.patchValue(result);
      },
      error: (e) => {
        this.ns.toast({
          message: 'Error retrieving user information.',
          id: 'user-info-error',
          title: 'Error'
        });

        console.error('Error retrieving user information.', e.message);
      }
    });
  }

  public updateUserInfo() {
    const form: Partial<UserInfo> = this.form.getRawValue();

    this.us.updateSignedOnEntity(form).subscribe({
      next: (result) => {
        this.ns.toast({
          message: 'User information updated.',
          id: 'user-info-update',
          title: 'Success'
        });
      },
      error: (e) => {
        this.ns.toast({
          message: 'Error updating user information.',
          id: 'user-info-update-error',
          title: 'Error'
        });

        console.error('Error updating user information.', e.message);
      }
    });
  }
}
