import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { SpeakerRole, SpeakerRoleRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Injectable()
export class SpeakerRoleProvider extends BaseProvider<SpeakerRole> {
  constructor(private readonly speakerRoleRepo: SpeakerRoleRepo) {
    super(speakerRoleRepo);
  }

  public async insertRoles(_roles: Array<Partial<SpeakerRole>>) {
    const roles = this.speakerRoleRepo.create(_roles);

    return this.speakerRoleRepo.insert(roles);
  }
}
