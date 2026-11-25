import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompetitionSeason, CompetitionSubmission } from '../entities/all.entities';
import { BaseService } from '../_base/base.service';

@Injectable()
export class SeasonService extends BaseService<CompetitionSeason> {
  constructor(
    @InjectRepository(CompetitionSeason) private seasonRepo: Repository<CompetitionSeason>,
    @InjectRepository(CompetitionSubmission) private submissionRepo: Repository<CompetitionSubmission>
  ) {
    super(seasonRepo);
  }

  public async getSeasonStatistics(guid: string) {
    const existing = await this.seasonRepo.findOne({
      where: {
        guid: guid
      }
    });

    if (!existing) {
      throw new NotFoundException();
    }

    const responses = await this.submissionRepo
      .createQueryBuilder('response')
      .where('response.season = :seasonGuid')
      .setParameter('seasonGuid', existing.guid)
      .getMany();

    const total = responses.length;

    const dictionary = responses.reduce((acc, response) => {
      const responseValue = response.value;

      // For each response, go through the value keys and append them to the accumulated object.
      // The answers are the JSON the app sent, which may be null (#3495); each is tallied by its text, as `in` and an
      // index read it.
      Object.entries(responseValue ?? {}).forEach(([key, answer]) => {
        const value = String(answer);

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
}
