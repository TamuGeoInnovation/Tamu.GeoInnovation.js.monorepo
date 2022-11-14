import { Injectable, NotFoundException, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';

import { CompetitionSeason, CompetitionSubmission } from '../entities/all.entities';
import { BaseService } from '../_base/base.service';

@Injectable()
export class SeasonService extends BaseService<CompetitionSeason> {
  constructor(@InjectRepository(CompetitionSeason) private seasonRepo: Repository<CompetitionSeason>) {
    super(seasonRepo);
  }

  public async getSeasonStatistics(guid: string) {
    const existing = await this.seasonRepo.findOne({
      guid: guid
    });

    if (!existing) {
      throw new NotFoundException();
    }

    const responses = await getRepository(CompetitionSubmission)
      .createQueryBuilder('response')
      .where('response.season = :seasonGuid')
      .setParameter('seasonGuid', existing.guid)
      .getMany();

    const total = responses.length;

    const dictionary = responses.reduce((acc, response) => {
      const responseValue = response.value;

      // For each response, go through the value keys and append them to the accumulated object.
      Object.entries(responseValue).forEach(([key, value]) => {
        if (!acc[key]) {
          // Each value key represents a question, and each question has a number of different responses.
          // If the key does not exist in the accumulated value yet, then create an other dictionary inside of it.
          // It will contain a tally of all the individual unique responses for that question.
          acc[key] = {};
        }

        // Check if the inner question object has an entry for the current question value.
        // If it does, increase the tally, otherwise create the entry.
        if (value in acc[key]) {
          acc[key][value]++;
        } else {
          acc[key][value] = 1;
        }
      });

      return acc;
    }, {});

    return {
      total,
      breakdown: dictionary
    };
  }

  public async setActiveSeason(seasonGuid: string): Promise<CompetitionSeason> {
    const currentActiveSeason = await this.seasonRepo.findOne({
      where: {
        active: true
      }
    });

    // If there is a currently active season, disable it first.
    if (currentActiveSeason) {
      // If the current active season shares the same input season guid,
      // skip the update operation and return early.
      if (currentActiveSeason.guid === seasonGuid) {
        return currentActiveSeason;
      }

      try {
        currentActiveSeason.active = false;

        await currentActiveSeason.save();
      } catch (e) {
        throw new InternalServerErrorException('Cannot disable active season.');
      }
    }

    const requestedSeasonToActivate = await this.seasonRepo.findOne({
      where: {
        guid: seasonGuid
      }
    });

    if (requestedSeasonToActivate) {
      requestedSeasonToActivate.active = true;

      try {
        return await requestedSeasonToActivate.save();
      } catch (e) {
        throw new InternalServerErrorException('Cannot enable requested season.');
      }
    } else {
      throw new UnprocessableEntityException();
    }
  }

  public async disableAllSeasons(): Promise<Array<CompetitionSeason>> {
    const activeSeasons = await this.seasonRepo.find({
      where: {
        active: true
      }
    });

    if (activeSeasons) {
      const queries = activeSeasons.map((season) => {
        season.active = false;

        return season.save();
      });

      try {
        return Promise.all(queries);
      } catch (e) {
        throw new InternalServerErrorException('Could not deactivate seasons.');
      }
    }
  }
}
