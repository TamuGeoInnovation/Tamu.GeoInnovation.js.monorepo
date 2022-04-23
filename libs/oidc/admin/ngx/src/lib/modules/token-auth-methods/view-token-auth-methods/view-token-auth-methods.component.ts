import { Component } from '@angular/core';

import { Observable } from 'rxjs';

import { TokenAuthMethodsService } from '@tamu-gisc/oidc/admin/data-access';
import { TokenEndpointAuthMethod } from '@tamu-gisc/oidc/common';

@Component({
  selector: 'tamu-gisc-view-token-auth-methods',
  templateUrl: './view-token-auth-methods.component.html',
  styleUrls: ['./view-token-auth-methods.component.scss']
})
export class ViewTokenAuthMethodsComponent {
  public $tokenAuthMethods: Observable<Array<Partial<TokenEndpointAuthMethod>>>;

  constructor(private readonly tokenAuthService: TokenAuthMethodsService) {
    this.$tokenAuthMethods = this.tokenAuthService.getTokenAuthMethods();
  }
}
