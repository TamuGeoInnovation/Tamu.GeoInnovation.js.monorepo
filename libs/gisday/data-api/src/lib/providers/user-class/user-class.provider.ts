import { Injectable } from '@nestjs/common';

import { DeepPartial } from 'typeorm';

import { Class, ClassRepo, UserClass, UserClassRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
@Injectable()
export class UserClassProvider extends BaseProvider<UserClass> {
  constructor(public readonly userClassRepo: UserClassRepo, private readonly classRepo: ClassRepo) {
    super(userClassRepo);
  }

  public async insertUserClass(chosenClass: DeepPartial<Class>, accountGuid: string) {
    const _class = await this.classRepo.findOne({
      where: {
        guid: chosenClass.guid
      }
    });
    const _newUserClass: Partial<UserClass> = {
      class: _class,
      accountGuid: accountGuid
    };
    const newUserClass = await this.userClassRepo.create(_newUserClass);
    return this.userClassRepo.save(newUserClass);
  }

  public async getClassesAndUserClasses(accountGuid: string) {
    const classes = await this.classRepo.find();
    const userClasses = await this.userClassRepo.getUsersClasses(accountGuid);

    classes.map((aClass) => {
      const intersection = userClasses.find((aUserClass) => {
        aUserClass.guid === aClass.guid;
      });

      if (intersection) {
        aClass.userInClass = true;
      }
    });

    return classes;
  }

  public async deleteUserClassWithClassGuid(classGuid: string) {
    const foundClass = await this.userClassRepo.find({
      where: {
        class: {
          guid: classGuid
        }
      }
    });
    if (foundClass) {
      return this.userClassRepo.remove(foundClass);
    } else {
      throw new Error('Could not find class with provided guid');
    }
  }
}
