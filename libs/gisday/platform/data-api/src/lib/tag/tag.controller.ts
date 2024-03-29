import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { Tag } from '../entities/all.entity';
import { TagProvider } from './tag.provider';

@Controller('tags')
export class TagController {
  constructor(private readonly provider: TagProvider) {}

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Get()
  public async getTags() {
    return this.provider.getTags();
  }

  @Permissions(['create:tags'])
  @UseGuards(JwtGuard, PermissionsGuard)
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

  @Permissions(['create:tags'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public async insertEntity(@Body('name') name: string) {
    return this.provider.createTag({
      name: name
    });
  }

  @Permissions(['update:tags'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string, @Body() body: DeepPartial<Tag>) {
    return this.provider.update(guid, body);
  }

  @Permissions(['delete:tags'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    return this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}
