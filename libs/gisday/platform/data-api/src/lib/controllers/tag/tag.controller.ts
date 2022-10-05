import { Body, Controller, Get, Post } from '@nestjs/common';

import { Tag } from '../../entities/all.entity';
import { TagProvider } from '../../providers/tag/tag.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('tag')
export class TagController extends BaseController<Tag> {
  constructor(private readonly tagProvider: TagProvider) {
    super(tagProvider);
  }

  @Get('/all')
  public async getTags() {
    return this.tagProvider.getTags();
  }

  @Post('/all')
  public async insertTags(@Body() body) {
    const _tags: Partial<Tag>[] = body.tags.map((value: Tag) => {
      const tag: Partial<Tag> = {
        name: value.name
      };

      return tag;
    });

    return this.tagProvider.insertTags(_tags);
  }
}
