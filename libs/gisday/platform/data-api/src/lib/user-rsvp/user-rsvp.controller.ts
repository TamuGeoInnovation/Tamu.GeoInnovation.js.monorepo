import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';

import { UserRsvpProvider } from './user-rsvp.provider';

@Controller('user-rsvps')
export class UserRsvpController {
  constructor(private readonly provider: UserRsvpProvider) {}

  @Get('/user/:guid')
  public async getUserRsvps(@Param() params) {
    return this.provider.getUserRsvps(params.guid);
  }

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Get()
  public async getEntities() {
    return this.provider.find();
  }

  @Post()
  public async insertUserRsvp(@Body() body) {
    const { eventGuid, rsvpTypeGuid, userGuid } = body;

    return this.provider.insertUserRsvp(eventGuid, rsvpTypeGuid, userGuid);
  }

  @Patch()
  public async updateEntity(@Body() body) {
    throw new NotImplementedException();
  }

  @Delete(':guid')
  public async deleteEntity(@Param() params) {
    throw new NotImplementedException();
  }
}
