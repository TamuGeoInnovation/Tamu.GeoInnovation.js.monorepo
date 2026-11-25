import { Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { CompetitionForm, CompetitionSeason } from '../entities/all.entities';
import { FormService } from './form.service';

/**
 * What the Designer sends: the form, and the season's settings. Either may be missing, and so may the whole body, which
 * Express 5 leaves undefined when nothing is sent; the service then refuses the form with a 400 (#3495).
 */
type FormBody = { form?: Partial<CompetitionForm>; season?: Partial<CompetitionSeason> } | undefined;

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
  public async updateSeasonForm(@Body() body: FormBody, @Param() { guid }: { guid: string }) {
    return this.service.updateForm(guid, formOf(body), seasonOf(body));
  }

  @Permissions(['create:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('active')
  public async insertFormForActiveSeason(@Body() body: FormBody) {
    return this.service.createFormForActiveSeason(formOf(body), seasonOf(body));
  }
}

/** The form's fields that are saved, and nothing else the body holds. */
function formOf(body: FormBody): Partial<CompetitionForm> {
  return { source: body?.form?.source, model: body?.form?.model };
}

/** The season's settings that are saved with its form, and nothing else the body holds. */
function seasonOf(body: FormBody): Partial<CompetitionSeason> {
  return {
    allowSubmissions: body?.season?.allowSubmissions,
    scoringOpensAt: body?.season?.scoringOpensAt,
    scoringClosesAt: body?.season?.scoringClosesAt
  };
}
