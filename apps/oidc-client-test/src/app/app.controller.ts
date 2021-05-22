import { Controller, Get, Request, UseGuards } from '@nestjs/common';

import { AuthenticatedGuard } from '@tamu-gisc/oidc/client';

@Controller()
export class AppController {
  constructor() {}

  @UseGuards(AuthenticatedGuard)
  @Get('/home')
  public home(@Request() req) {
    return {
      user: req.user
    };
  }
}
