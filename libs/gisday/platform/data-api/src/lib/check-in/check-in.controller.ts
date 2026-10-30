import {
  Controller,
  Get,
  Post,
  Request,
  Body,
  UseGuards,
  Param,
  Delete,
  Patch,
  NotImplementedException,
  Req,
  BadRequestException
} from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { CheckInProvider } from './check-in.provider';

@Controller('check-ins')
export class CheckInController {
  constructor(private readonly provider: CheckInProvider) {}

  @UseGuards(JwtGuard)
  @Get('user/event/:eventGuid')
  public async getUserCheckinForEvent(@Request() req, @Param('eventGuid') eventGuid) {
    if (!eventGuid) {
      throw new BadRequestException('Event guid is missing');
    }

    return this.provider.getUserCheckinForEvent(eventGuid, req.user.sub);
  }

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions(['read:checkins'])
  @Get('user/:userGuid')
  public async getCheckinsForUser(@Param('userGuid') userGuid) {
    return this.provider.getCheckinsForUser(userGuid);
  }

  @UseGuards(JwtGuard)
  @Get('user')
  public async getLoggedInUserCheckins(@Request() req) {
    return this.provider.getCheckinsForUser(req.user.sub);
  }

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions(['read:checkins'])
  @Get('')
  public async getAllCheckins() {
    return this.provider.find();
  }

  @UseGuards(JwtGuard)
  @Post()
  public async insertUserCheckin(
    @Req() req,
    @Body('eventGuid') eventGuid,
    @Body('latitude') latitude?: number,
    @Body('longitude') longitude?: number,
    @Body('accuracy') accuracy?: number,
    @Body('code') code?: string
  ) {
    if (!eventGuid) {
      throw new BadRequestException('Event guid is missing');
    }

    // An in-person event needs the attendee's position (#1766), and a hybrid or virtual one the code in
    // its QR code (#2560); the provider checks both.
    return this.provider.insertUserCheckin(eventGuid, req.user.sub, { latitude, longitude, accuracy }, code);
  }

  /**
   * The code in a hybrid or virtual session's check-in QR code (#2560), for an organizer to put on the
   * presenter's slides. The same permission as adding a check-in by hand, since the code checks people in.
   */
  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions(['create:checkins'])
  @Get('code/:eventGuid')
  public async getCheckInCode(@Param('eventGuid') eventGuid: string) {
    return this.provider.getCheckInCode(eventGuid);
  }

  /**
   * Checks in the attendee named in the body, for an organizer adding a check-in by hand (the admin
   * page's Check-ins > Add). The endpoint above checks in whoever is signed in, and so ignores a
   * `userGuid` it is sent (#1767). It asks for no location and is not held to the event's check-in
   * zone (#1766): it is how organizers add the exceptions the zone refuses.
   */
  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions(['create:checkins'])
  @Post('admin')
  public async insertAttendeeCheckin(@Body('userGuid') userGuid: string, @Body('eventGuid') eventGuid: string) {
    if (!userGuid || !eventGuid) {
      throw new BadRequestException('User guid and event guid are required');
    }

    return this.provider.insertAttendeeCheckin(eventGuid, userGuid);
  }

  @UseGuards(JwtGuard)
  @Patch(':guid')
  public async updateEntity() {
    throw new NotImplementedException();
  }

  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions(['delete:checkins'])
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    return this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}
