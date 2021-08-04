import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { AzureIdpGuard } from '@tamu-gisc/oidc/client';
import { RequiredGroups, GroupsGuard } from '@tamu-gisc/ues/common/nest';
import { ROLES } from '@tamu-gisc/ues/common/types';

import { InterventionsService, ValveInterventionAttributes } from './interventions.service';

@Controller('interventions')
export class InterventionsController {
  constructor(private is: InterventionsService) {}

  @Get('valve/:id')
  public getInterventionsForValve(@Param() { id }: { id: string }) {
    return this.is.getAllInterventionsForValveId(id);
  }

  @Get(':id')
  public getInterventionById(@Param() { id }: { id: string }) {
    return this.is.getIntervention(id);
  }

  @Get('')
  public getInterventions() {
    return this.is.getAllInterventions();
  }

  @Post()
  @RequiredGroups([ROLES.ADMIN, ROLES.PUBLISHER])
  @UseGuards(AzureIdpGuard, GroupsGuard)
  public insertIntervention(@Body() body: { intervention: ValveInterventionAttributes }) {
    return this.is.insertIntervention(body.intervention);
  }
}
