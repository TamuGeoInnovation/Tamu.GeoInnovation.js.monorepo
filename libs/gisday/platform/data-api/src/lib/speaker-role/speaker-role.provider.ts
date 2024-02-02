import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SpeakerRole } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class SpeakerRoleProvider extends BaseProvider<SpeakerRole> {
  constructor(@InjectRepository(SpeakerRole) private speakerRoleRepo: Repository<SpeakerRole>) {
    super(speakerRoleRepo);
  }

  public async insertRoles(roles: Array<Partial<SpeakerRole>>) {
    const created = this.speakerRoleRepo.create(roles);

    return this.speakerRoleRepo.insert(created);
  }
}
