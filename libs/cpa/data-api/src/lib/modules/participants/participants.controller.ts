import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '@tamu-gisc/oidc/common';

import {
  CreateParticipantForWorkshopDto,
  DeleteParticipantDto,
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

  @UseGuards(JwtGuard)
  @Post('workshop')
  public createParticipantForWorkshop(@Body() dto: CreateParticipantForWorkshopDto) {
    return this.service.createParticipantForWorkshop(dto);
  }

  @UseGuards(JwtGuard)
  @Patch()
  public updateParticipantName(@Body() dto: UpdateParticipantDto) {
    return this.service.updateParticipant(dto);
  }

  @UseGuards(JwtGuard)
  @Delete(':participantGuid')
  public deleteParticipant(@Param() dto: DeleteParticipantDto) {
    return this.service.deleteParticipant(dto);
  }
}
