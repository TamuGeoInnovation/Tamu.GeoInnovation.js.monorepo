import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import {
  CreateParticipantForWorkshopDto,
  GetParticipantsForWorkshopDto,
  ParticipantsService,
  UpdateParticipantDto
} from './participants.service';

@Controller('participants')
export class ParticipantsController {
  constructor(private readonly service: ParticipantsService) {}
  @Get('workshop/:workshopGuid')
  public getParticipantsForWorkshop(@Param() dto: GetParticipantsForWorkshopDto) {
    return this.service.getParticipantsForWorkshop(dto);
  }

  @Post('workshop')
  public createParticipantForWorkshop(@Body() dto: CreateParticipantForWorkshopDto) {
    return this.service.createParticipantForWorkshop(dto);
  }

  @Patch()
  public updateParticipantName(@Body() dto: UpdateParticipantDto) {
    return this.service.updateParticipant(dto);
  }
}
