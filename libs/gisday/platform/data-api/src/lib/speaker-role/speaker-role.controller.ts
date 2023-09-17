import { Body, Controller, Post } from '@nestjs/common';

import { SpeakerRole } from '../entities/all.entity';
import { BaseController } from '../_base/base.controller';
import { SpeakerRoleProvider } from './speaker-role.provider';

@Controller('speaker-roles')
export class SpeakerRoleController extends BaseController<SpeakerRole> {
  constructor(private readonly speakerRoleProvider: SpeakerRoleProvider) {
    super(speakerRoleProvider);
  }

  @Post('/bulk')
  public async insertSpeakerRoles(@Body() body) {
    const _roles: Partial<SpeakerRole>[] = body.roles.map((value: SpeakerRole) => {
      const tag: Partial<SpeakerRole> = {
        name: value.name
      };
      return tag;
    });

    return this.speakerRoleProvider.insertRoles(_roles);
  }
}
