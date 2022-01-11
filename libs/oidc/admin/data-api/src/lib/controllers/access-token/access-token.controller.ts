import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';

import { AdminRoleGuard } from '@tamu-gisc/oidc/client';

import { AccessTokenService } from '../../services/access-token/access-token.service';

@UseGuards(AdminRoleGuard)
@Controller('access-token')
export class AccessTokenController {
  constructor(private readonly accessTokenService: AccessTokenService) {}

  @Get()
  public async accessTokensAllGet() {
    return this.accessTokenService.getAllAccessTokens();
  }

  @Delete('delete/:grantId')
  public async accessTokenRevoke(@Param() params) {
    return this.accessTokenService.revokeAccessToken(params.grantId);
  }
}
