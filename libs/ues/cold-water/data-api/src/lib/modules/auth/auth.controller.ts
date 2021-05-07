import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';

import { AzureIdpGuard } from '@tamu-gisc/oidc/client';

@Controller('auth')
export class AuthController {
  @UseGuards(AzureIdpGuard)
  @Get('')
  public getStatus(@Req() req) {
    return HttpStatus.OK;
  }
}
