import { Injectable } from '@nestjs/common';

import { Tag, TagRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
@Injectable()
export class TagProvider extends BaseProvider<Tag> {
  constructor(private readonly tagRepo: TagRepo) {
    super(tagRepo);
  }
}
