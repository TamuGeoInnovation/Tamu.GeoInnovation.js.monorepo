import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionForm, CompetitionSeason } from '../entities/all.entities';
import { BaseService } from '../_base/base.service';
import { activeSeason as findActiveSeason } from '../season/active-season';

@Injectable()
export class FormService extends BaseService<CompetitionForm> {
  constructor(
    @InjectRepository(CompetitionForm) private formRepo: Repository<CompetitionForm>,
    @InjectRepository(CompetitionSeason) private competitionSeasonRepo: Repository<CompetitionSeason>,
    @InjectRepository(Season) private seasonRepo: Repository<Season>
  ) {
    super(formRepo);
  }

  public getSeason(seasonGuid: string) {
    return this.competitionSeasonRepo.findOne({
      relations: { form: true },
      where: {
        season: {
          guid: seasonGuid
        }
      }
    });
  }

  public async getActiveSeason() {
    const activeSeason = await findActiveSeason(this.seasonRepo);

    const form = await this.competitionSeasonRepo.findOne({
      where: {
        season: { guid: activeSeason.guid }
      },
      relations: { form: true, season: true }
    });

    if (!form) {
      throw new NotFoundException('No form found for active season.');
    }

    return form;
  }

  public async createFormForActiveSeason(form: Partial<CompetitionForm>, season?: Partial<CompetitionSeason>) {
    const activeSeason = await findActiveSeason(this.seasonRepo);
    const existingCompSeason = await this.competitionSeasonRepo.findOne({
      where: {
        season: { guid: activeSeason.guid }
      }
    });

    if (!existingCompSeason) {
      // Validate that exactly one question is marked as discriminator
      const discriminatorCount = form.model?.filter((q) => q.isDiscriminator === true).length || 0;
      if (discriminatorCount !== 1) {
        throw new BadRequestException('Form must have exactly one discriminator question');
      }

      const window = scoringWindow(season);

      try {
        const _form = this.formRepo.create({ ...form });

        const compSeason = this.competitionSeasonRepo.create({
          season: activeSeason,
          form: _form,
          allowSubmissions: season?.allowSubmissions === true,
          ...window
        });

        return compSeason.save();
      } catch {
        throw new InternalServerErrorException('Failed to create competition season .');
      }
    } else {
      throw new InternalServerErrorException('Competition season already exists.');
    }
  }

  public async updateForm(formGuid: string, form: Partial<CompetitionForm>, season?: Partial<CompetitionSeason>) {
    const competitionSeason = await this.competitionSeasonRepo.findOne({
      where: {
        form: {
          guid: formGuid
        }
      },
      relations: { form: true }
    });

    if (!competitionSeason) {
      throw new BadRequestException('No form found for provided guid.');
    }

    const model = form.model;

    // Validate that exactly one question is marked as discriminator
    if (model?.filter((q) => q.isDiscriminator === true).length !== 1) {
      throw new BadRequestException('Form must have exactly one discriminator question');
    }

    // Only the settings it is sent (#3862): one left out keeps the season's, rather than turning submissions off or
    // clearing the scoring window. The window is checked as it will be, the sent moments over the kept ones.
    const window = scoringWindow({
      scoringOpensAt: season?.scoringOpensAt !== undefined ? season.scoringOpensAt : competitionSeason.scoringOpensAt,
      scoringClosesAt: season?.scoringClosesAt !== undefined ? season.scoringClosesAt : competitionSeason.scoringClosesAt
    });
    // Cannot be undefined: the season was found by this form's guid, and the same query loads the form.
    const competitionForm = competitionSeason.form!;

    try {
      competitionForm.model = model;
      // A form sent without its source keeps the one it has, as it did when the missing source was simply not saved.
      competitionForm.source = form.source ?? competitionForm.source;
      competitionSeason.allowSubmissions =
        season?.allowSubmissions === undefined ? competitionSeason.allowSubmissions : season.allowSubmissions === true;
      competitionSeason.scoringOpensAt = window.scoringOpensAt;
      competitionSeason.scoringClosesAt = window.scoringClosesAt;

      return competitionSeason.save();
    } catch {
      throw new InternalServerErrorException('Failed to update competition season form.');
    }
  }
}

/**
 * The season's scoring window as the Designer sent it (#2474): each moment as a date, or `null` for no limit
 * on that side. Refuses a moment that is not a date, and a window that closes at or before it opens.
 */
function scoringWindow(season?: { scoringOpensAt?: unknown; scoringClosesAt?: unknown }) {
  const moment = (value: unknown, which: string): Date | null => {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const date = new Date(value as string);

    if (isNaN(date.getTime())) {
      throw new BadRequestException(`When scoring ${which} is not a date.`);
    }

    return date;
  };

  const scoringOpensAt = moment(season?.scoringOpensAt, 'opens');
  const scoringClosesAt = moment(season?.scoringClosesAt, 'closes');

  if (scoringOpensAt && scoringClosesAt && scoringClosesAt.getTime() <= scoringOpensAt.getTime()) {
    throw new BadRequestException('Scoring must close after it opens.');
  }

  return { scoringOpensAt, scoringClosesAt };
}
