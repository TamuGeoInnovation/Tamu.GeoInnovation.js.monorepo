import { Body, Controller, Get, Param, Post } from '@nestjs/common';

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
  public insertIntervention(@Body() body: {intervention: ValveInterventionAttributes}){
    return this.is.insertIntervention(body.intervention);
  }
}
