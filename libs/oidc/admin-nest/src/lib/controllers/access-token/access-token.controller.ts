import { Controller, Post, Req, Res, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { AccessTokenService } from '../../services/access-token/access-token.service';
import { AdminRoleGuard } from '@tamu-gisc/oidc/client';

@UseGuards(AdminRoleGuard)
@Controller('access-token')
export class AccessTokenController {
  constructor(private readonly accessTokenService: AccessTokenService) {}

  @Get()
  async accessTokensAllGet() {
    return this.accessTokenService.getAllAccessTokens();
  }

  @Delete('delete/:grantId')
  async accessTokenRevoke(@Param() params) {
    return this.accessTokenService.revokeAccessToken(params.grantId);
  }
}
