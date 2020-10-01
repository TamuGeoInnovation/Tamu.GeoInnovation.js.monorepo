import { Component, OnInit } from '@angular/core';
import { TokenAuthMethodsService } from '@tamu-gisc/oidc/admin-data-access';
import { TokenEndpointAuthMethod } from '@tamu-gisc/oidc/provider-nestjs';
import { Observable } from 'rxjs';

@Component({
  selector: 'view-token-auth-methods',
  templateUrl: './view-token-auth-methods.component.html',
  styleUrls: ['./view-token-auth-methods.component.scss']
})
export class ViewTokenAuthMethodsComponent implements OnInit {
  public $tokenAuthMethods: Observable<Array<Partial<TokenEndpointAuthMethod>>>;

  constructor(private readonly tokenAuthService: TokenAuthMethodsService) {
    this.$tokenAuthMethods = this.tokenAuthService.getTokenAuthMethods();
  }

  ngOnInit(): void {}
}
