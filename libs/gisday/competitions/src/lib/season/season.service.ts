import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';

import { IsNotEmpty } from 'class-validator';

import { CompetitionSeason, CompetitionSubmission } from '../entities/all.entities';
import { BaseService } from '../_base/base.service';

@Injectable()
export class SeasonService extends BaseService<CompetitionSeason> {
  constructor(@InjectRepository(CompetitionSeason) private seasonRepo: Repository<CompetitionSeason>) {
    super(seasonRepo);
  }

  public async getSeasonStatistics(season: string) {
    const existing = await this.seasonRepo.findOne({
      year: season
    });

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
        if (acc[key].hasOwnProperty(value)) {
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

export class GetSeasonStatisticsDto {
  @IsNotEmpty()
  public season: string;
}

export class SeasonStatisticsDto {
  /**
   * Total number of responses for a given season.
   */
  public total: number;

  /**
   * A dictionary where the keys represent the question id in a season form. The inner object inside each
   * represents the count of individual response values for that question.
   */
  public breakdown: {
    [question_id: string]: {
      [count: string]: number;
    };
  };
}
