import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeleteResult, In, Repository } from 'typeorm';

import { Speaker, University } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { rethrowHttp } from '../_base/rethrow-http';
import { SeasonScopedProvider } from '../_base/season-scoped-provider';

@Injectable()
export class UniversityProvider extends SeasonScopedProvider<University> {
  protected get seasons() {
    return this.seasonService;
  }

  protected readonly recordsName = 'universities';

  protected forSeason(seasonGuid: string) {
    return this.getEntitiesForSeason(seasonGuid);
  }

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
      relations: { season: true },
      order: {
        name: 'ASC'
      }
    });
  }

  public async getEntitiesForActiveSeason() {
    return this.forActiveSeason();
  }

  public async insertUniversitiesIntoSeason(seasonGuid: string, existingEntityGuids: Array<string>) {
    return this.copyIntoSeason(seasonGuid, existingEntityGuids);
  }

  public override async deleteEntities(oneOrMoreEntityGuids: Array<string> | string): Promise<DeleteResult> {
    const guids = typeof oneOrMoreEntityGuids === 'string' ? oneOrMoreEntityGuids.split(',') : oneOrMoreEntityGuids;

    try {
      // Awaited so the catch below can actually see a failed transaction; see the note in
      // `insertUniversitiesIntoSeason`.
      return await this.universityRepo.manager.transaction(async (transactionalEntityManager) => {
        const speakersForUniversity = await transactionalEntityManager.find(Speaker, {
          where: {
            university: In(guids)
          },
          relations: { university: true }
        });

        // Remove university from all events
        speakersForUniversity.forEach((speaker) => {
          speaker.university = null;
        });

        await transactionalEntityManager.save(speakersForUniversity);

        return transactionalEntityManager.delete(University, guids);
      });
    } catch (err) {
      rethrowHttp(err, new UnprocessableEntityException('Could not delete universities.'), () =>
        Logger.error(err.message, 'UniversityProvider.deleteEntities')
      );
    }
  }
}
