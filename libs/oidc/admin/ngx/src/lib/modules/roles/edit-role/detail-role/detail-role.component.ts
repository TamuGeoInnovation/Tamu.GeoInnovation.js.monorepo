import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { debounceTime, switchMap } from 'rxjs/operators';

import { RolesService } from '@tamu-gisc/oidc/admin/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-detail-role',
  templateUrl: './detail-role.component.html',
  styleUrls: ['./detail-role.component.scss']
})
export class DetailRoleComponent implements OnInit {
  public roleGuid: string;
  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private roleService: RolesService,
    private notificationService: NotificationService
  ) {
    this.form = this.fb.group({
      guid: [''],
      name: [''],
      level: ['']
    });
  }

  public ngOnInit() {
    if (this.route.snapshot.params.roleGuid) {
      this.roleGuid = this.route.snapshot.params.roleGuid;

      this.roleService
        .getRole(this.roleGuid)
        .pipe(
          switchMap((role) => {
            this.form.patchValue(role);

            return this.form.valueChanges.pipe(debounceTime(1000));
          }),
          switchMap(() => {
            return this.roleService.updateRole(this.form.getRawValue());
          })
        )
        .subscribe(() => {
          this.notificationService.preset('edit_role');
        });
    }
  }
}
