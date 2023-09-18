import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeepPartial, Repository } from 'typeorm';

import { Class, UserClass } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class UserClassProvider extends BaseProvider<UserClass> {
  constructor(
    @InjectRepository(UserClass) public userClassRepo: Repository<UserClass>,
    @InjectRepository(Class) private classRepo: Repository<Class>
  ) {
    super(userClassRepo);
  }

  public async insertUserClass(chosenClass: DeepPartial<Class>, accountGuid: string) {
    const existing = await this.classRepo.findOne({
      where: {
        guid: chosenClass.guid
      }
    });

    const created = await this.userClassRepo.create({
      class: existing,
      accountGuid: accountGuid
    });

    return this.userClassRepo.save(created);
  }

  public async getClassesAndUserClasses(accountGuid: string) {
    const classes = await this.classRepo.find();
    const userClasses = await this.userClassRepo.find({
      where: {
        accountGuid: accountGuid
      },
      relations: ['class']
    });

    classes.map((aClass) => {
      const intersection = userClasses.find((aUserClass) => {
        return aUserClass.guid === aClass.guid;
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
