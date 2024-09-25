import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Tag } from '../entities/all.entity';
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

    if (season === undefined) {
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
      throw new UnprocessableEntityException('Could not copy tags into season');
    }
  }

  public async insertTags(tags: Array<Partial<Tag>>) {
    const created = this.tagRepo.create(tags);

    return this.tagRepo.insert(created);
  }

  public async createTag(tag: Partial<Tag>) {
    const existing = await this.tagRepo.findOne({ where: { ...tag } });

    if (existing === undefined) {
      const newTag = this.tagRepo.create(tag);

      return this.tagRepo.save(newTag);
    } else {
      return existing;
    }
  }
}
