import { Component } from '@angular/core';

import { Observable } from 'rxjs';

import { AccessTokenService } from '@tamu-gisc/oidc/admin/data-access';
import { AccessToken } from '@tamu-gisc/oidc/common';

@Component({
  selector: 'tamu-gisc-view-access-token',
  templateUrl: './view-access-token.component.html',
  styleUrls: ['./view-access-token.component.scss']
})
export class ViewAccessTokenComponent {
  public $accessTokens: Observable<Array<Partial<AccessToken>>>;

  constructor(private readonly accessTokenService: AccessTokenService) {
    this.$accessTokens = this.accessTokenService.getAccessTokens();
  }
}
