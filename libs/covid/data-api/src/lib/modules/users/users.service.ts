import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(@InjectRepository(User) public repo: Repository<User>) {
    super(repo);
  }

  public async verifyEmail(email: string) {
    if (!email || email.length === 0) {
      return {
        statusCode: 500,
        success: false,
        message: 'Input parameter missing'
      };
    }

    const user = await this.repo.findOne({
      select: ['email', 'guid'],
      where: {
        email: email
      }
    });

    if (!user) {
      return {
        statusCode: 400,
        success: false,
        message: 'Email not found'
      };
    }

    return user;
  }

  public async registerEmail(email: string) {
    if (!email || email.length === 0) {
      return {
        status: 500,
        success: false,
        message: 'Input parameter missing'
      };
    }

    let user = await this.repo.findOne({ email: email });

    if (!user) {
      user = this.repo.create({ email: email });
      await user.save();
    }

    return this.repo.findOne({
      select: ['email', 'guid'],
      where: {
        guid: user.guid
      }
    });
  }
}
