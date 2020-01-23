import { Controller, Get, Post, Body } from '@nestjs/common';

import { Workshop, Scenario } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { WorkshopsService } from './workshops.service';

@Controller('workshops')
export class WorkshopsController extends BaseController<Workshop> {
  constructor(private service: WorkshopsService) {
    super(service);
  }

  @Get('')
  public getAll() {
    return this.service.getMany({ relations: ['scenarios'] });
  }

  @Post('scenario')
  public async addScenario(@Body() body) {
    const existing = await this.service.repository.findOne({ where: { guid: body.guid }, relations: ['scenarios'] });


    if (existing) {
      
      const scenario = new Scenario();
      scenario.guid = body.scenario;

      existing.scenarios = [...existing.scenarios, scenario];

      return existing.save();
    }
  }
}
