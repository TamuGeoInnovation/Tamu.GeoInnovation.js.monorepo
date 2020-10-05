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
    const newClass = req.body.class;
    const _class = await this.classRepo.findOne({
      where: {
        guid: newClass.guid
      }
    });
    const _newUserClass: Partial<UserClass> = {
      class: _class,
      userGuid: req.user.sub
    };
    const newUserClass = await this.userClassRepo.create(_newUserClass);
    return this.userClassRepo.save(newUserClass);
  }

  async getClassesAndUserClasses(req: Request) {
    const classes = await this.classRepo.find();
    if (req.user) {
      const userClasses = await this.userClassRepo.getUsersClasses(req.user.sub);
      await classes.forEach((aClass) => {
        userClasses.forEach((aUserClass) => {
          if (aUserClass.class.guid === aClass.guid) {
            aClass.userInClass = true;
          }
        });
      });
      return classes;
    }
  }

  async deleteUserClassWithClassGuid(req: Request) {
    const { classGuid } = req.body;
    const foundClass = await this.userClassRepo.find({
      where: {
        class: {
          guid: classGuid
        }
      }
    });
    if (foundClass) {
      this.userClassRepo.remove(foundClass);
    }
  }
}
