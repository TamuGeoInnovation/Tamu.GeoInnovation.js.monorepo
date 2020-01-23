import { Controller, Get, Post, Body, Delete, HttpException, Res, Param, Patch } from '@nestjs/common';

import { Workshop, Scenario } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { WorkshopsService } from './workshops.service';
import { getRepository } from 'typeorm';

@Controller('workshops')
export class WorkshopsController extends BaseController<Workshop> {
  constructor(private service: WorkshopsService) {
    super(service);
  }

  /**
   * Returns a list of all workshops and their associated scenarios.
   */
  @Get('')
  public getAll() {
    return this.service.getMany({ relations: ['scenarios'] });
  }

  /**
   * Returns a specific workshop record.
   */
  @Get(':guid')
  public async getOne(@Param() params) {
    const existing = await this.service.getOne({ where: { guid: params.guid }, relations: ['scenarios'] });
    if (existing) {
      return existing;
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  /**
   * Updates an existing workshop record with provided body key-values.
   */
  @Patch(':guid')
  public async updateOne(@Body() body: IWorkshopRequestBody, @Param() params) {
    try {
      await this.service.repository.update({ guid: params.guid }, { ...body });
      return;
    } catch (err) {
      throw new HttpException('Internal Server Error', 500);
    }
  }

  /**
   * Removes an existing workshop record.
   */
  @Delete(':guid')
  public async deleteOne(@Param() params) {
    try {
      await this.service.repository.delete({ guid: params.guid });

      return;
    } catch (err) {
      throw new HttpException('Internal Server Error', 500);
    }
  }

  /**
   * Adds a scenario to a workshop
   */
  @Post('scenario')
  public async addScenario(@Body() body: IScenarioRequestBody) {
    const existing = await this.service.repository.findOne({ where: { guid: body.workshopGuid }, relations: ['scenarios'] });

    if (existing) {
      // Get the existing scenario, if it exists.
      const scenario = await getRepository(Scenario).findOne({ where: { guid: body.scenarioGuid } });

      existing.scenarios.push(scenario);

      try {
        return await existing.save();
      } catch (err) {
        return err;
      }
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  /**
   * Deletes a scenario from a workshop
   */
  @Delete('scenario')
  public async deleteScenario(@Body() body: IScenarioRequestBody, @Res() res: Response) {
    const existing = await this.service.repository.findOne({ where: { guid: body.workshopGuid }, relations: ['scenarios'] });

    if (existing) {
      existing.scenarios = existing.scenarios.filter((s) => s.guid !== body.scenarioGuid);

      return await existing.save();
    } else {
      throw new HttpException('Not Found', 404);
    }
  }
}

interface IWorkshopRequestBody {
  guid: string;
}
interface IScenarioRequestBody {
  scenarioGuid: string;
  workshopGuid: string;
}
