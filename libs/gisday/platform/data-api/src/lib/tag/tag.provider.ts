import { HttpException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Tag, Season } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { SeasonService } from '../season/season.service';

@Injectable()
export class TagProvider extends BaseProvider<Tag> {
  constructor(@InjectRepository(Tag) private tagRepo: Repository<Tag>, private readonly seasonService: SeasonService) {
    super(tagRepo);
  }

  public async getTagsForSeason(seasonGuid: string) {
    return this.tagRepo.find({
      where: {
        season: {
          guid: seasonGuid
        }
      },
      order: {
        name: 'ASC'
      }
    });
  }

  public async getTagsForActiveSeason() {
    const activeSeason = await this.seasonService.findOneActive();

    if (!activeSeason) {
      throw new UnprocessableEntityException('No active season found.');
    }

    return this.getTagsForSeason(activeSeason.guid);
  }

  public async getTags() {
    return this.tagRepo.find({
      order: {
        name: 'ASC'
      }
    });
  }

  public async copyTagsIntoSeason(seasonGuid: string, existingGuids: Array<string>) {
    const season = await this.seasonService.findOne({
      where: {
        guid: seasonGuid
      }
    });

    // TypeORM 0.3 `findOne` resolves null, not undefined, so this guard never fired: copying
    // into a season that does not exist fell through and wrote tags with a null season,
    // leaving orphaned rows attached to no season at all.
    if (!season) {
      throw new UnprocessableEntityException('Could not find season.');
    }

    const entities = await this.tagRepo.find({
      where: {
        guid: In(existingGuids)
      }
    });

    if (entities?.length === 0) {
      throw new UnprocessableEntityException('Could not find tags.');
    }

    const newEntities = entities.map((tag) => {
      delete tag.guid;
      delete tag.created;
      delete tag.updated;

      return this.tagRepo.create({
        ...tag,
        season
      });
    });

    try {
      return this.tagRepo.save(newEntities);
    } catch (err) {
      // An HttpException carries a deliberate status. Re-wrapping it below turned intended
      // 404s and 422s into 500s, so the caller could not tell "not found" from "server broke".
      if (err instanceof HttpException) {
        throw err;
      }

      throw new UnprocessableEntityException('Could not copy tags into season');
    }
  }

  public async insertTags(tags: Array<Partial<Tag>>) {
    const created = this.tagRepo.create(tags);

    return this.tagRepo.insert(created);
  }

  public async createTag(tag: Partial<Tag>) {
    const qb = this.tagRepo.createQueryBuilder('tag');
    qb.where('tag.name = :name', { name: tag.name });

    if (tag.season && (tag.season as Season).guid) {
      qb.leftJoin('tag.season', 'season').andWhere('season.guid = :guid', { guid: (tag.season as Season).guid });
    }
    const existing = await qb.getOne();

    // Same TypeORM 0.3 change as above, but here it disabled the create path entirely:
    // `getOne` resolves null for no match, so this never took the true branch and the method
    // returned that null instead of creating the tag. The endpoint has never created one.
    if (!existing) {
      const newTag = this.tagRepo.create(tag);

      return this.tagRepo.save(newTag);
    } else {
      return existing;
    }
  }
}
