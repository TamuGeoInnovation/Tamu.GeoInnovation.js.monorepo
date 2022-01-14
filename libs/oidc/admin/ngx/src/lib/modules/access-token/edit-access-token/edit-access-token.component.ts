import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { AccessTokenService } from '@tamu-gisc/oidc/admin/data-access';
import { AccessToken } from '@tamu-gisc/oidc/common';

@Component({
  selector: 'edit-access-token',
  templateUrl: './edit-access-token.component.html',
  styleUrls: ['./edit-access-token.component.scss']
})
export class EditAccessTokenComponent implements OnInit {
  public $accessTokens: Observable<Array<Partial<AccessToken>>>;

  constructor(private readonly accessTokenService: AccessTokenService) {
    this.fetchAccessTokens();
  }

  public ngOnInit(): void {}

  public fetchAccessTokens() {
    this.$accessTokens = this.accessTokenService.getAccessTokens();
  }

  public revokeAccessToken(accessToken: AccessToken): void {
    console.log('Revoking access token...', accessToken);
    this.accessTokenService.revokeAccessToken(accessToken).subscribe((deleteStatus) => {
      this.fetchAccessTokens();
    });
  }
}
