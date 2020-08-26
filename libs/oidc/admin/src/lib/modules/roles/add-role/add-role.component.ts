import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RolesService } from '@tamu-gisc/oidc/admin-data-access';

@Component({
  selector: 'add',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit {
  public form: FormGroup;
  constructor(private fb: FormBuilder, private roleService: RolesService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      level: ['', Validators.required]
    });
  }

  public submitAddRole() {
    this.roleService.createRole(this.form.value);
  }
}
