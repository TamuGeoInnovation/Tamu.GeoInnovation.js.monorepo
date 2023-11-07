import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

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

  public async insertUserClass(classGuid: string, accountGuid: string) {
    const existingRegistration = await this.userClassRepo.findOne({
      where: {
        accountGuid: accountGuid,
        class: {
          guid: classGuid
        }
      }
    });

    if (existingRegistration) {
      throw new BadRequestException('User is already registered for this class');
    }

    const existing = await this.classRepo.findOne({
      where: {
        guid: classGuid
      }
    });

    const created = await this.userClassRepo.create({
      class: existing,
      accountGuid: accountGuid
    });

    try {
      return this.userClassRepo.save(created);
    } catch (err) {
      throw new InternalServerErrorException('Could not save user class registration');
    }
  }

  public getUserClasses(guid: string) {
    return this.userClassRepo.find({
      where: {
        accountGuid: guid
      }
    });
  }

  public async deleteUserClassRegistration(classGuid: string, accountGuid: string) {
    const foundClass = await this.userClassRepo.findOne({
      where: {
        class: {
          guid: classGuid
        }
      }
    });

    if (!foundClass) {
      throw new NotFoundException('User class not found');
    }

    if (foundClass && foundClass.accountGuid !== accountGuid) {
      throw new ForbiddenException();
    }

    try {
      return this.userClassRepo.delete(foundClass.guid);
    } catch (err) {
      throw new InternalServerErrorException('Could not delete user class registration');
    }
  }
}
