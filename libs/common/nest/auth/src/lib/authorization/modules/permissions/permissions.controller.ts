import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('authorization/permissions')
export class PermissionsController {
  @UseGuards(AuthGuard('jwt'))
  @Get('')
  public getSessionPermissions(@Request() req) {
    return req.user.permissions;
  }
}
