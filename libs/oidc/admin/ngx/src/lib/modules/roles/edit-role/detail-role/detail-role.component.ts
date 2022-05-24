import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { debounceTime } from 'rxjs/operators';

import { Role } from '@tamu-gisc/oidc/common';
import { RolesService } from '@tamu-gisc/oidc/admin/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-detail-role',
  templateUrl: './detail-role.component.html',
  styleUrls: ['./detail-role.component.scss']
})
export class DetailRoleComponent implements OnInit {
  public roleGuid: string;
  public role: Partial<Role>;
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
      this.roleService.getRole(this.roleGuid).subscribe((role) => {
        this.role = role;
        this.form.patchValue(this.role);
        this.form.valueChanges.pipe(debounceTime(1000)).subscribe(() => {
          this.roleService
            .updateRole(this.form.getRawValue())
            .subscribe(() => [this.notificationService.preset('edit_role')]);
        });
      });
    }
  }
}
