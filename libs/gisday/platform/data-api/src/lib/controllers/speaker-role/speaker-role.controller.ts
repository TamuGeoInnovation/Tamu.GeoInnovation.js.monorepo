import { Body, Controller, Post } from '@nestjs/common';

import { SpeakerRole } from '../../entities/all.entity';
import { BaseController } from '../../controllers/_base/base.controller';
import { SpeakerRoleProvider } from '../../providers/speaker-role/speaker-role.provider';

@Controller('speaker-role')
export class SpeakerRoleController extends BaseController<SpeakerRole> {
  constructor(private readonly speakerRoleProvider: SpeakerRoleProvider) {
    super(speakerRoleProvider);
  }

  @Post('/all')
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
