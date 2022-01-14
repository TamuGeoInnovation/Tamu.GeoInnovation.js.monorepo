import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { AzureIdpGuard } from '@tamu-gisc/oidc/client';
import { RequiredGroups, GroupsGuard } from '@tamu-gisc/ues/common/nest';
import { ROLES } from '@tamu-gisc/ues/common/nest';

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

  @Put()
  @RequiredGroups([ROLES.ADMIN, ROLES.PUBLISHER])
  @UseGuards(AzureIdpGuard, GroupsGuard)
  public updateIntervention(@Body() body: { intervention: ValveInterventionAttributes }) {
    return this.is.updateIntervention(body.intervention);
  }

  @Delete(':id')
  @RequiredGroups([ROLES.ADMIN, ROLES.PUBLISHER])
  @UseGuards(AzureIdpGuard, GroupsGuard)
  public deleteIntervention(@Param() params: { id: number }) {
    return this.is.deleteIntervention({ OBJECTID: params.id });
  }
}
