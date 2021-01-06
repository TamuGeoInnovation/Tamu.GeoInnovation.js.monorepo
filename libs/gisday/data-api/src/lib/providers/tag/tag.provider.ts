import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { Tag, TagRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Injectable()
export class TagProvider extends BaseProvider<Tag> {
  constructor(private readonly tagRepo: TagRepo) {
    super(tagRepo);
  }

  public async insertTags(_tags: Array<Partial<Tag>>) {
    const tags = this.tagRepo.create(_tags);

    return this.tagRepo.insert(tags);
  }
}
