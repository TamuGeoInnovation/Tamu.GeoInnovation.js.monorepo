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

  @Post()
  public async insertEntity(@Body() body: DeepPartial<SpeakerRole>) {
    throw new NotImplementedException();
  }

  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string, @Body() body: DeepPartial<SpeakerRole>) {
    throw new NotImplementedException();
  }

  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}
