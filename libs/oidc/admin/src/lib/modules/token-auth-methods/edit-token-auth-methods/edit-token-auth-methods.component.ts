import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { TokenAuthMethodsService } from '@tamu-gisc/oidc/admin-data-access';
import { TokenEndpointAuthMethod } from '@tamu-gisc/oidc/common';

@Component({
  selector: 'edit-token-auth-methods',
  templateUrl: './edit-token-auth-methods.component.html',
  styleUrls: ['./edit-token-auth-methods.component.scss']
})
export class EditTokenAuthMethodsComponent implements OnInit {
  public $tokenAuthMethods: Observable<Array<Partial<TokenEndpointAuthMethod>>>;

  constructor(private readonly tokenAuthService: TokenAuthMethodsService) {}

  public ngOnInit(): void {
    this.fetchTokenAuthMethods();
  }

  public fetchTokenAuthMethods() {
    this.$tokenAuthMethods = this.tokenAuthService.getTokenAuthMethods().pipe(shareReplay(1));
  }

  public deleteTokenAuthMethod(tokenAuthMethod: TokenEndpointAuthMethod) {
    console.log('deleteTokenAuthMethod', tokenAuthMethod);
    this.tokenAuthService.deleteTokenEndpointAuthMethod(tokenAuthMethod).subscribe((deleteStatus) => {
      console.log('Deleted ', tokenAuthMethod.guid);
      this.fetchTokenAuthMethods();
    });
  }
}
