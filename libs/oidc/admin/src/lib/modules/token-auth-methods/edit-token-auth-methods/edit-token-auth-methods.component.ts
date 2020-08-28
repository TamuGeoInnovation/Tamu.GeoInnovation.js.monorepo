import { Component, OnInit } from '@angular/core';
import { TokenAuthMethodsService } from '@tamu-gisc/oidc/admin-data-access';
import { TokenEndpointAuthMethod } from '@tamu-gisc/oidc/provider-nest';
import { Observable } from 'rxjs';

@Component({
  selector: 'edit-token-auth-methods',
  templateUrl: './edit-token-auth-methods.component.html',
  styleUrls: ['./edit-token-auth-methods.component.scss']
})
export class EditTokenAuthMethodsComponent implements OnInit {
  public $tokenAuthMethods: Observable<Array<Partial<TokenEndpointAuthMethod>>>;

  constructor(private readonly tokenAuthService: TokenAuthMethodsService) {
    this.$tokenAuthMethods = this.tokenAuthService.getTokenAuthMethods();
  }
  ngOnInit(): void {}
  public deleteTokenAuthMethod() {}
}
