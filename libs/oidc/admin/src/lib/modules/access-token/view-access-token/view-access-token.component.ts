import { Component, OnInit } from '@angular/core';
import { AccessTokenService } from '@tamu-gisc/oidc/admin-data-access';
import { AccessToken } from '@tamu-gisc/oidc/provider-nestjs';
import { Observable } from 'rxjs';

@Component({
  selector: 'view-access-token',
  templateUrl: './view-access-token.component.html',
  styleUrls: ['./view-access-token.component.scss']
})
export class ViewAccessTokenComponent implements OnInit {
  public $accessTokens: Observable<Array<Partial<AccessToken>>>;

  constructor(private readonly accessTokenService: AccessTokenService) {
    this.$accessTokens = this.accessTokenService.getAccessTokens();
  }
  ngOnInit(): void {}
}
