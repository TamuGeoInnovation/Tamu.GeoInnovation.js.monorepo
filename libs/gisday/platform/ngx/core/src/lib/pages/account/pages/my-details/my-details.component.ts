import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Observable, map, shareReplay } from 'rxjs';

import { UniversityService, UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { GisDayAppMetadata, University } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-my-details',
  templateUrl: './my-details.component.html',
  styleUrls: ['./my-details.component.scss']
})
export class MyDetailsComponent implements OnInit {
  public form: FormGroup;

  private _signedOnEntity: Observable<GisDayAppMetadata>;
  public signedOnEntityIsSocial: Observable<boolean>;
  public universities$: Observable<Array<Partial<University>>>;

  constructor(
    private fb: FormBuilder,
    private ns: NotificationService,
    private readonly us: UserService,
    private readonly is: UniversityService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      user_info: this.fb.group({
        given_name: [null],
        family_name: [null],
        email: [{ value: null, disabled: true }]
      }),
      app_metadata: this.fb.group({
        gisday: this.fb.group({
          attendeeType: [null]
        })
      }),
      user_metadata: this.fb.group({
        education: this.fb.group({
          id: [null],
          institution: [null],
          fieldOfStudy: [null],
          classification: [null]
        }),
        occupation: this.fb.group({
          employer: [null],
          department: [null],
          position: [null]
        })
      })
    });

    this._signedOnEntity = this.us.getSignedOnEntity().pipe(shareReplay());
    this.signedOnEntityIsSocial = this._signedOnEntity.pipe(
      map((user) => {
        return user.user_info.social;
      })
    );

    this.universities$ = this.is.getEntities().pipe(
      map((universities) => {
        universities.push({
          guid: 'other',
          name: 'Other'
        });

        return universities;
      }),
      shareReplay()
    );

    this._signedOnEntity.subscribe({
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
    const form: Partial<GisDayAppMetadata> = this.form.getRawValue();

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
