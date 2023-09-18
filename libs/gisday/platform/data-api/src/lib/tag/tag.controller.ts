import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Tag } from '../entities/all.entity';
import { TagProvider } from './tag.provider';

@Controller('tags')
export class TagController {
  constructor(private readonly provider: TagProvider) {}

  @Get()
  public async getTags() {
    return this.provider.getTags();
  }

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Post('/bulk')
  public async insertTags(@Body() body) {
    const _tags: Partial<Tag>[] = body.tags.map((value: Tag) => {
      const tag: Partial<Tag> = {
        name: value.name
      };

      return tag;
    });

    return this.provider.insertTags(_tags);
  }

  @Post()
  public async insertEntity(@Body() body: DeepPartial<Tag>) {
    throw new NotImplementedException();
  }

  @Patch()
  public async updateEntity(@Body() body) {
    throw new NotImplementedException();
  }

  @Delete(':guid')
  public async deleteEntity(@Param() params) {
    throw new NotImplementedException();
  }
}
