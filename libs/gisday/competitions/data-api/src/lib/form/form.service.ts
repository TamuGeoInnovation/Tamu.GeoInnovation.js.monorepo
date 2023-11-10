import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionForm, CompetitionSeason } from '../entities/all.entities';
import { BaseService } from '../_base/base.service';

@Injectable()
export class FormService extends BaseService<CompetitionForm> {
  constructor(
    @InjectRepository(CompetitionForm) private formRepo: Repository<CompetitionForm>,
    @InjectRepository(CompetitionSeason) private competitionSeasonRepo: Repository<CompetitionSeason>,
    @InjectRepository(Season) private seasonRepo: Repository<Season>
  ) {
    super(formRepo);
  }

  public getSeason(year: string) {
    return this.competitionSeasonRepo.findOne({
      relations: ['form'],
      where: [
        {
          year: year
        },
        {
          guid: year
        }
      ]
    });
  }

  public async getActiveSeason() {
    const activeSeason = await this._getActiveSeason();

    const form = await this.competitionSeasonRepo.findOne({
      where: {
        season: activeSeason
      },
      relations: ['form']
    });

    if (!form) {
      throw new NotFoundException('No form found for active season.');
    }

    return form;
  }

  public async createFormForActiveSeason(form: Partial<CompetitionForm>) {
    const activeSeason = await this._getActiveSeason();
    const existingCompSeason = await this.competitionSeasonRepo.findOne({
      where: {
        season: activeSeason
      }
    });

    if (!existingCompSeason) {
      try {
        const _form = this.formRepo.create({ ...form });

        const compSeason = this.competitionSeasonRepo.create({
          season: activeSeason,
          form: _form
        });

        return compSeason.save();
      } catch (err) {
        throw new InternalServerErrorException('Failed to create competition season .');
      }
    } else {
      throw new InternalServerErrorException('Competition season already exists.');
    }
  }

  private async _getActiveSeason() {
    const activeSeason = await this.seasonRepo.findOne({
      where: {
        active: true
      }
    });

    if (!activeSeason) {
      throw new NotFoundException('No active season found.');
    }

    return activeSeason;
  }
}
