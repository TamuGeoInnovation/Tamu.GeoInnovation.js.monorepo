import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { SpeakerRole } from '../entities/all.entity';
import { SpeakerRoleProvider } from './speaker-role.provider';

@Controller('speaker-roles')
export class SpeakerRoleController {
  constructor(private readonly provider: SpeakerRoleProvider) {}

  @Get()
  public async getEntities() {
    return this.provider.find();
  }

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Post()
  public async insertEntity(@Body() body: DeepPartial<SpeakerRole>) {
    throw new NotImplementedException();
  }

  @Post('/bulk')
  public async insertSpeakerRoles(@Body() body) {
    const _roles: Partial<SpeakerRole>[] = body.roles.map((value: SpeakerRole) => {
      const tag: Partial<SpeakerRole> = {
        name: value.name
      };
      return tag;
    });

    return this.provider.insertRoles(_roles);
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
