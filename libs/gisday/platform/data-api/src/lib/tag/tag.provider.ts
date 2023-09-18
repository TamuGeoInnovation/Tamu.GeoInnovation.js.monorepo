import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Tag } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class TagProvider extends BaseProvider<Tag> {
  constructor(@InjectRepository(Tag) private tagRepo: Repository<Tag>) {
    super(tagRepo);
  }

  public async getTags() {
    return this.tagRepo.find({
      order: {
        name: 'ASC'
      }
    });
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
