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
  public async insertUserCheckin(@Req() req, @Body('eventGuid') eventGuid) {
    if (!eventGuid) {
      throw new BadRequestException('Event guid is missing');
    }

    return this.provider.insertUserCheckin(eventGuid, req.user.sub);
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
