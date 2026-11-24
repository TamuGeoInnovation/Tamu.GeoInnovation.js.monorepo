import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event, Tag, Season } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { SeasonScopedProvider } from '../_base/season-scoped-provider';

@Injectable()
export class TagProvider extends SeasonScopedProvider<Tag> {
  protected get seasons() {
    return this.seasonService;
  }

  protected readonly recordsName = 'tags';

  protected forSeason(seasonGuid: string) {
    return this.getTagsForSeason(seasonGuid);
  }

  constructor(
    @InjectRepository(Tag) private tagRepo: Repository<Tag>,
    private readonly seasonService: SeasonService
  ) {
    super(tagRepo);
  }

  /**
   * The sessions that have a tag (#3033), for its admin page, as a broadcast's (#3032): each with its day and place, so the
   * page can order them and list only its site's. Hidden sessions too, which is why the route is for admins.
   */
  public async getSessions(guid: string) {
    const tag = await this.tagRepo.findOne({ where: { guid } });

    if (!tag) {
      throw new NotFoundException('Tag not found.');
    }

    return this.tagRepo.manager.find(Event, {
      where: { tags: { guid } },
      relations: { day: true, location: { place: true } }
    });
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
    return this.forActiveSeason();
  }

  public async getTags() {
    return this.tagRepo.find({
      order: {
        name: 'ASC'
      }
    });
  }

  public async copyTagsIntoSeason(seasonGuid: string, existingGuids: Array<string>) {
    return this.copyIntoSeason(seasonGuid, existingGuids);
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
