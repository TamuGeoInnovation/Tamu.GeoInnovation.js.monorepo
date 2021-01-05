import { Controller, Post, Req } from '@nestjs/common';

import { Request } from 'express';

import { Tag } from '../../entities/all.entity';
import { TagProvider } from '../../providers/tag/tag.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('tag')
export class TagController extends BaseController<Tag> {
  constructor(private readonly tagProvider: TagProvider) {
    super(tagProvider);
  }

  @Post('/all')
  public async insertTags(@Req() req: Request) {
    return this.tagProvider.insertTags(req);
  }
}
