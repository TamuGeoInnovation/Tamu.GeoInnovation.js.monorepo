import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeleteResult, In, Repository } from 'typeorm';

import { Speaker, University } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { SeasonService } from '../season/season.service';

@Injectable()
export class UniversityProvider extends BaseProvider<University> {
  constructor(
    @InjectRepository(University) private universityRepo: Repository<University>,
    private readonly seasonService: SeasonService
  ) {
    super(universityRepo);
  }

  public async getEntitiesForSeason(guid: string) {
    return this.find({
      where: {
        season: {
          guid
        }
      },
      relations: ['season'],
      order: {
        name: 'ASC'
      }
    });
  }

  public async getEntitiesForActiveSeason() {
    const activeSeason = await this.seasonService.findOneActive();

    if (!activeSeason) {
      throw new UnprocessableEntityException('No active season found.');
    }

    return this.getEntitiesForSeason(activeSeason.guid);
  }

  public async insertUniversitiesIntoSeason(seasonGuid: string, existingEntityGuids: Array<string>) {
    const season = await this.seasonService.findOne({
      where: {
        guid: seasonGuid
      }
    });

    if (!season) {
      throw new UnprocessableEntityException('Season not found.');
    }

    const entities = await this.find({
      where: {
        guid: In(existingEntityGuids)
      }
    });

    if (entities?.length === 0) {
      throw new UnprocessableEntityException('Could not find universities.');
    }

    const newEntities = entities.map((entity) => {
      delete entity.guid;
      delete entity.created;
      delete entity.updated;

      return this.universityRepo.create({
        ...entity,
        season
      });
    });

    try {
      return this.universityRepo.save(newEntities);
    } catch (err) {
      Logger.error(err.message, 'UniversityProvider');
      throw new UnprocessableEntityException('Could not insert universities into season.');
    }
  }

  public override async deleteEntities(oneOrMoreEntityGuids: Array<string> | string): Promise<DeleteResult> {
    const guids = typeof oneOrMoreEntityGuids === 'string' ? oneOrMoreEntityGuids.split(',') : oneOrMoreEntityGuids;

    try {
      return this.universityRepo.manager.transaction(async (transactionalEntityManager) => {
        const speakersForUniversity = await transactionalEntityManager.find(Speaker, {
          where: {
            university: In(guids)
          },
          relations: ['university']
        });

        // Remove university from all events
        speakersForUniversity.forEach((speaker) => {
          speaker.university = null;
        });

        await transactionalEntityManager.save(speakersForUniversity);

        return transactionalEntityManager.delete(University, guids);
      });
    } catch (err) {
      Logger.error(err.message, 'UniversityProvider.deleteEntities');
      throw new UnprocessableEntityException('Could not delete universities.');
    }
  }
}
