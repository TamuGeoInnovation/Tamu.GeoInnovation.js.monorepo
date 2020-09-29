import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { ClassRepo, UserClass, UserClassRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
@Injectable()
export class UserClassProvider extends BaseProvider<UserClass> {
  constructor(public readonly userClassRepo: UserClassRepo, private readonly classRepo: ClassRepo) {
    super(userClassRepo);
  }

  async insertUserClass(req: Request) {
    const { classGuid, userGuid } = req.body;
    const _class = await this.classRepo.findOne({
      where: {
        guid: classGuid
      }
    });
    const _newUserClass: Partial<UserClass> = {
      class: _class,
      userGuid: userGuid
    };
    const newUserClass = await this.userClassRepo.create(_newUserClass);
    this.userClassRepo.save(newUserClass);
  }
}
