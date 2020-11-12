import { Controller, Patch, Param, Body, Delete } from '@nestjs/common';

import { Scenario } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { ScenariosService } from './scenarios.service';
import { IScenariosRequestPayload } from './scenarios.service';

@Controller('scenarios')
export class ScenariosController extends BaseController<Scenario> {
  constructor(private service: ScenariosService) {
    super(service);
  }

  /**
   * Updates an existing scenario
   */
  @Patch(':guid')
  public async update(@Param() params: IScenariosRequestPayload, @Body() body: IScenariosRequestPayload) {
    return await this.service.updateScenario(params, body);
  }

  /**
   * Deletes an existing scenario
   */
  @Delete(':guid')
  public async delete(@Param() params: IScenariosRequestPayload) {
    return await this.service.deleteScenario(params);
  }
}
