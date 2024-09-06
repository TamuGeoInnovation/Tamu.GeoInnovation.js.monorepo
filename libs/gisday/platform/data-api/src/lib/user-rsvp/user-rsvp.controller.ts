import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { UserRsvpProvider } from './user-rsvp.provider';

@Controller('rsvps')
export class UserRsvpController {
  constructor(private readonly provider: UserRsvpProvider) {}

  @UseGuards(JwtGuard)
  @Get('/user/event/:guid')
  public async getUserRsvpForEvent(@Req() req, @Param('guid') guid) {
    return this.provider.getUserRsvpForEvent(req.user.sub, guid);
  }

  @UseGuards(JwtGuard)
  @Get('/user/')
  public async getUserRsvps(@Req() req) {
    return this.provider.getUserRsvps(req.user.sub);
  }

  @Permissions(['read:rsvps'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Permissions(['read:rsvps'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get()
  public async getEntities() {
    return this.provider.find();
  }

  @UseGuards(JwtGuard)
  @Post()
  public async insertUserRsvp(@Req() req, @Body() { eventGuid, rsvpTypeGuid = null }) {
    return this.provider.insertUserRsvp(eventGuid, rsvpTypeGuid, req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Patch(':guid')
  public async updateEntity() {
    throw new NotImplementedException();
  }

  @UseGuards(JwtGuard)
  @Delete(':guid')
  public deleteEntity(@Req() req, @Param('guid') guid: string) {
    return this.provider.deleteRsvpForUser(guid, req.user.sub);
  }
}
