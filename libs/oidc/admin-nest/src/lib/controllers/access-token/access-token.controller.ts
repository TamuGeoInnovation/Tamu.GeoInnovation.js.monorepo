import { Controller, Post, Req, Res, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AccessTokenService } from '../../services/access-token/access-token';
import { AdminRoleGuard } from '@tamu-gisc/oidc/client';

// @UseGuards(AdminRoleGuard)
@Controller('access-token')
export class AccessTokenController {
  constructor(private readonly accessTokenService: AccessTokenService) {}

  @Get()
  async accessTokensAllGet() {
    return this.accessTokenService.getAllAccessTokens();
  }
}
