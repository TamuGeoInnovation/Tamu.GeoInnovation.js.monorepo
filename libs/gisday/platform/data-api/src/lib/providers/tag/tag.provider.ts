import { Injectable } from '@nestjs/common';

import { Tag, TagRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Injectable()
export class TagProvider extends BaseProvider<Tag> {
  constructor(private readonly tagRepo: TagRepo) {
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
}
