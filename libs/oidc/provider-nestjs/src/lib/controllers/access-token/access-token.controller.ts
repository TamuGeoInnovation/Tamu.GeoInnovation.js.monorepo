import { Controller, Delete, Param } from '@nestjs/common';

import { OpenIdProvider } from '../../configs/oidc-provider-config';

@Controller('access-token')
export class AccessTokenController {
  @Delete(':grantId')
  public async revokeAccessToken(@Param() params) {
    const grantId = params.grantId;

    OpenIdProvider.provider.AccessToken.revokeByGrantId(grantId);
  }
}
