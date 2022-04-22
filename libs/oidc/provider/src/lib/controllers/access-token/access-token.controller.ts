import { Controller, Delete, NotImplementedException, Param } from '@nestjs/common';

@Controller('access-token')
export class AccessTokenController {
  @Delete(':grantId')
  public async revokeAccessToken(@Param() params) {
    // TODO: Reimplement a means to revoke access. With JWT this would be adding a JWT access token to a black list
    // const grantId = params.grantId;
    // OpenIdProvider.provider.AccessToken.revokeByGrantId(grantId);

    return new NotImplementedException();
  }
}
