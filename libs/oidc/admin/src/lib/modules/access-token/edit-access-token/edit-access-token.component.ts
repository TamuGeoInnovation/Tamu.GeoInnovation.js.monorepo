import { Component, OnInit } from '@angular/core';
import { AccessTokenService } from '@tamu-gisc/oidc/admin-data-access';
import { AccessToken } from '@tamu-gisc/oidc/provider-nestjs';
import { Observable } from 'rxjs';

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
  ngOnInit(): void {}

  fetchAccessTokens() {
    this.$accessTokens = this.accessTokenService.getAccessTokens();
  }

  revokeAccessToken(accessToken: AccessToken): void {
    console.log('Revoking access token...', accessToken);
    this.accessTokenService.revokeAccessToken(accessToken).subscribe((deleteStatus) => {
      // console.log('Deleted ', client.guid);
      this.fetchAccessTokens();
    });
  }
}
