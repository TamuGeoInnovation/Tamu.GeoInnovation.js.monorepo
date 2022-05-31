import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { RolesService } from '@tamu-gisc/oidc/admin/data-access';

@Component({
  selector: 'tamu-gisc-add',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit {
  public form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private roleService: RolesService,
    private notificationService: NotificationService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      level: ['', Validators.required]
    });
  }

  public submitAddRole() {
    this.roleService.createRole(this.form.value).subscribe(() => {
      this.notificationService.preset('add_role');
    });
  }
}
