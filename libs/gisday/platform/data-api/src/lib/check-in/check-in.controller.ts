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
import { DeepPartial } from 'typeorm';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { CheckInProvider } from './check-in.provider';
import { CheckIn } from '../entities/all.entity';

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
  public async getUserCheckins(@Param('userGuid') userGuid) {
    return this.provider.findOne({
      where: {
        accountGuid: userGuid
      }
    });
  }

  @UseGuards(JwtGuard)
  @Get()
  public async getUsersCheckins(@Request() req) {
    return this.provider.find({
      where: {
        accountGuid: req.user.sub
      }
    });
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
  public async updateEntity(@Param('guid') guid: string, @Body() body: DeepPartial<CheckIn>) {
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
