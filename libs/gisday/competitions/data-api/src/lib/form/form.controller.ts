import { Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

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
  public async updateSeasonForm(@Body() { form, season }, @Param() { guid }: { guid: string }) {
    return this.service.updateForm(
      guid,
      {
        source: form.source,
        model: form.model
      },
      {
        allowSubmissions: season.allowSubmissions
      }
    );
  }

  @Permissions(['create:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('active')
  public async insertFormForActiveSeason(@Body() { form, season }) {
    return this.service.createFormForActiveSeason(
      {
        source: form.source,
        model: form.model
      },
      {
        allowSubmissions: season.allowSubmissions
      }
    );
  }
}
