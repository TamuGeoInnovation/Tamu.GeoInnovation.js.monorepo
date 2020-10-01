import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { TokenEndpointAuthMethod } from '@tamu-gisc/oidc/provider-nestjs';
import { TokenAuthMethodsService } from '@tamu-gisc/oidc/admin-data-access';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'detail-token-auth-method',
  templateUrl: './detail-token-auth-method.component.html',
  styleUrls: ['./detail-token-auth-method.component.scss']
})
export class DetailTokenAuthMethodComponent implements OnInit {
  public tokenAuthMethodGuid: string;
  public tokenAuthMethod: Partial<TokenEndpointAuthMethod>;
  public form: FormGroup;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private tokenService: TokenAuthMethodsService) {
    this.form = this.fb.group({
      guid: [''],
      type: [''],
      details: ['']
    });
  }

  public ngOnInit() {
    if (this.route.snapshot.params.tokenAuthMethodGuid) {
      this.tokenAuthMethodGuid = this.route.snapshot.params.tokenAuthMethodGuid;
      this.tokenService.getTokenAuthMethod(this.tokenAuthMethodGuid).subscribe((tokenAuthMethod) => {
        this.tokenAuthMethod = tokenAuthMethod;
        this.form.patchValue(this.tokenAuthMethod);
        this.form.valueChanges.pipe(debounceTime(1000)).subscribe((res) => {
          this.tokenService
            .updateTokenEndpointAuthMethod(this.form.getRawValue())
            .subscribe((result) => [console.log('Updated details')]);
        });
      });
    }
  }
}
