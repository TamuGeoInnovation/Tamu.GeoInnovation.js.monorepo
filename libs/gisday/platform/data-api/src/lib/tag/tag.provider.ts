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

  public async insertTags(_tags: Array<Partial<Tag>>) {
    const tags = this.tagRepo.create(_tags);

    return this.tagRepo.insert(tags);
  }

  public async createTag(tag: Partial<Tag>) {
    return this.tagRepo.save(tag);
  }
}
