import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { SpeakerRole, SpeakerRoleRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Injectable()
export class SpeakerRoleProvider extends BaseProvider<SpeakerRole> {
  constructor(private readonly speakerRoleRepo: SpeakerRoleRepo) {
    super(speakerRoleRepo);
  }

  public async insertRoles(req: Request) {
    const _roles: Partial<SpeakerRole>[] = [];
    req.body.roles.map((value: SpeakerRole) => {
      const tag: Partial<SpeakerRole> = {
        name: value.name
      };
      _roles.push(tag);
    });
    const roles = this.speakerRoleRepo.create(_roles);

    return this.speakerRoleRepo.insert(roles);
  }
}
