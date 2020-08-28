import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GrantTypesService } from '@tamu-gisc/oidc/admin-data-access';

@Component({
  selector: 'add-grant-types',
  templateUrl: './add-grant-types.component.html',
  styleUrls: ['./add-grant-types.component.scss']
})
export class AddGrantTypesComponent implements OnInit {
  public form: FormGroup;
  constructor(private fb: FormBuilder, private grantService: GrantTypesService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      details: ['', Validators.required]
    });
  }

  public submitGrantType() {
    this.grantService.createGrantType(this.form.value);
  }
}
