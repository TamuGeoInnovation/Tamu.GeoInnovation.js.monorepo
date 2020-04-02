import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

import { Lockdown, User, Source, SourceType } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class LockdownsService extends BaseService<Lockdown> {
  constructor(
    @InjectRepository(Lockdown) public repo: Repository<Lockdown>,
    @InjectRepository(User) public userRepo: Repository<User>,
    @InjectRepository(Source) public sourceRepo: Repository<Source>,
    @InjectRepository(SourceType) public classificationRepo: Repository<SourceType>
  ) {
    super(repo);
  }

  /**
   * Registers a county lockdown
   */
  public async registerLockdown(params) {
    //
    // Resolve user by existing or new email
    //
    const userFindOptions = {
      email: params.email
    };

    const user = await this.userRepo.findOne(userFindOptions);

    if (!user) {
      return {
        status: 400,
        success: false,
        message: 'Unregistered email.'
      };
    }

    //
    // Resolve submission classification
    //
    const classification = await this.classificationRepo.findOne({ guid: params.classification });

    const source = this.sourceRepo.create({
      url: params.url,
      user: user,
      sourceType: classification,
      healthDepartmentUrl: params.healthDepartmentUrl
    });

    //
    // Create lockdown
    //
    const lockdown = this.repo.create({ ...params, source, user } as DeepPartial<Lockdown>);

    return lockdown.save();
  }
}
