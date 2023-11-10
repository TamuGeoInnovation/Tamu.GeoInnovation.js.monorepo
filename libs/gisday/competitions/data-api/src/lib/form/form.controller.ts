import { Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { CompetitionForm } from '../entities/all.entities';
import { FormService } from './form.service';

@Controller('competitions/forms')
export class FormController {
  constructor(private service: FormService) {}

  @Get('active')
  public async getFormForActiveSeason() {
    return this.service.getActiveSeason();
  }

  @Get(':year')
  public async getForm(@Param() params) {
    const season = await this.service.getSeason(params.year);

    if (season) {
      return season;
    } else {
      throw new NotFoundException();
    }
  }

  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public async updateSeasonForm(@Body() body, @Param() { guid }: { guid: string }) {
    return this.service.updateFormForSeason(guid, {
      source: body.source,
      model: body.model
    });
  }

  @Permissions(['create:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('active')
  public async insertFormForActiveSeason(@Body() body) {
    return this.service.createFormForActiveSeason({
      source: body.source,
      model: body.model
    });
  }

  @Permissions(['create:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post(':year')
  public async insertForm(@Body() body, @Param() params) {
    const _form: DeepPartial<CompetitionForm> = {
      source: body.source,
      model: body.model
    };

    const form = this.service.repository.create(_form);

    const season = await this.service.getSeason(params.year);

    season.form = form;

    await season.save();

    return season;
  }
}
