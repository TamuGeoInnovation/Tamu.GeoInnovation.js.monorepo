import { Controller, Post, Req } from '@nestjs/common';

import { Request } from 'express';

import { BaseController } from '../../controllers/_base/base.controller';
import { SpeakerRole } from '../../gisday-data-api';
import { SpeakerRoleProvider } from '../../providers/speaker-role/speaker-role.provider';

@Controller('speaker-role')
export class SpeakerRoleController extends BaseController<SpeakerRole> {
  constructor(private readonly speakerRoleProvider: SpeakerRoleProvider) {
    super(speakerRoleProvider);
  }

  @Post('/all')
  public async insertSpeakerRoles(@Req() req: Request) {
    const _roles: Partial<SpeakerRole>[] = [];
    req.body.roles.map((value: SpeakerRole) => {
      const tag: Partial<SpeakerRole> = {
        name: value.name
      };
      _roles.push(tag);
    });
    return this.speakerRoleProvider.insertRoles(_roles);
  }
}
