import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Tag, TagRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
@Injectable()
export class TagProvider extends BaseProvider<Tag> {
  constructor(private readonly tagRepo: TagRepo) {
    super(tagRepo);
  }

  async insertTags(req: Request) {
    const _tags: Partial<Tag>[] = [];
    req.body.tags.map((value: Tag) => {
      const tag: Partial<Tag> = {
        name: value.name
      };
      _tags.push(tag);
    });
    const tags = this.tagRepo.create(_tags);

    return this.tagRepo.insert(tags);
  }
}
