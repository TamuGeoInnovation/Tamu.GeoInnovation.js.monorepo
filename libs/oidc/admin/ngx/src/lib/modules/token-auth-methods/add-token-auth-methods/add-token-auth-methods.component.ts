import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { TokenAuthMethodsService } from '@tamu-gisc/oidc/admin-data-access';

@Component({
  selector: 'add-token-auth-methods',
  templateUrl: './add-token-auth-methods.component.html',
  styleUrls: ['./add-token-auth-methods.component.scss']
})
export class AddTokenAuthMethodsComponent implements OnInit {
  public form: FormGroup;
  constructor(private fb: FormBuilder, private tokenService: TokenAuthMethodsService) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      type: ['', Validators.required],
      details: ['', Validators.required]
    });
  }

  public submitTokenAuthMethod() {
    this.tokenService.createTokenEndpointAuthMethod(this.form.value);
  }
}
