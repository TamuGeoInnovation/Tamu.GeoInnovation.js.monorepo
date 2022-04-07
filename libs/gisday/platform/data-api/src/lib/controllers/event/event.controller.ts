import { Body, Controller, Get, Param, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

import jwtDecode from 'jwt-decode';

import { Event } from '../../entities/all.entity';
import { EventProvider } from '../../providers/event/event.provider';
import { BaseController } from '../../controllers/_base/base.controller';
import { DeepPartial } from 'typeorm';

@Controller('event')
export class EventController extends BaseController<Event> {
  constructor(private readonly eventProvider: EventProvider) {
    super(eventProvider, 'event');
  }

  @Get('/all')
  public async getEvents() {
    return this.eventProvider.getEntitiesWithRelations('event');
  }

  @Get('/:guid/rsvps')
  public async getNumberOfRsvps(@Param() params) {
    return this.eventProvider.getNumberOfRsvps(params.guid);
  }

  @Get('by-day')
  public async getEntitiesByDay(@Request() req) {
    // const accountGuid = req.user.sub;
    // const jwt = req.headers['authorization'];
    // need to make a check here or somewhere for 'Bearer null'
    // const accessToken: {
    //   sub: string;
    // } = jwtDecode(jwt);
    // const joe = req;
    // return;
    return this.eventProvider.getEntitiesByDay();
  }

  @Post()
  @UseInterceptors(FileInterceptor(''))
  public async insertEvent(@Body() body) {
    const _newEvent: DeepPartial<Event> = body;
    return this.eventProvider.insertEvent(_newEvent);
  }
}
