import { Controller, Get, Post, Body, Delete, HttpException, Param, Patch } from '@nestjs/common';

import { Workshop } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { WorkshopsService } from './workshops.service';

@Controller('workshops')
export class WorkshopsController extends BaseController<Workshop> {
  constructor(private service: WorkshopsService) {
    super(service);
  }

  /**
   * Adds a scenario to a workshop
   */
  @Post('scenario')
  public async addScenario(@Body() body) {
    return await this.service.addNewScenario(body);
  }

  /**
   * Deletes a scenario from a workshop
   */
  @Delete('scenario/:workshopGuid/:scenarioGuid')
  public async deleteScenario(@Param() params) {
    return await this.service.deleteScenario(params);
  }

  /**
   * Returns a specific workshop record.
   */
  @Get(':guid')
  public async getOne(@Param() params) {
    return await this.service.getOne(params);
  }

  /**
   * Updates an existing workshop record with provided body key-values.
   */
  @Patch(':guid')
  public async updateOne(@Body() body, @Param() params) {
    return await this.service.updateWorkshop(body, params);
  }

  /**
   * Removes an existing workshop record.
   */
  @Delete(':guid')
  public async deleteOne(@Param() params) {
    return await this.service.deleteWorkshop(params);
  }

  /**
   * Returns a list of all workshops and their associated scenarios.
   */
  @Get('')
  public getAll() {
    return this.service.getMany({ relations: ['scenarios'] });
  }
}
