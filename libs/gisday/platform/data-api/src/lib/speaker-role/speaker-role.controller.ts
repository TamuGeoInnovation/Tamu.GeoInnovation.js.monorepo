import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { SpeakerRole } from '../entities/all.entity';
import { SpeakerRoleProvider } from './speaker-role.provider';

@Controller('speaker-roles')
export class SpeakerRoleController {
  constructor(private readonly provider: SpeakerRoleProvider) {}

  @Get()
  public async getEntities() {
    return this.provider.find();
  }

  @Permissions(['create:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
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

  @Permissions(['delete:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}
