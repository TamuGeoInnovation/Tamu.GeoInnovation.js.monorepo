import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, TestingSite } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User) public repo: Repository<User>,
    @InjectRepository(TestingSite) public testingSiteRepo: Repository<TestingSite>
  ) {
    super(repo);
  }

  public async getUsers() {
    return this.repo.find({
      select: ['email', 'guid', 'created', 'updated'],
      order: {
        email: 'ASC'
      }
    });
  }

  public async getUsersWithStats() {
    const users = await this.repo
      .createQueryBuilder('user')
      .addSelect(['user.email'])
      .leftJoinAndSelect('user.claims', 'claims')
      .leftJoinAndSelect('claims.sites', 'sites')
      .leftJoinAndSelect('claims.lockdowns', 'lockdowns')
      .orderBy('user.email', 'ASC')
      .getMany();

    const stats = users.map((user) => {
      return {
        ...user,
        claimsCount: user.claims.length,
        sitesCount: user.claims.reduce((acc, curr) => curr.sites.length + acc, 0),
        lockdownsCount: user.claims.reduce((acc, curr) => curr.lockdowns.length + acc, 0)
      };
    });

    return stats;
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

export interface UserWithStats extends Partial<User> {
  claimsCount: number;
  sitesCount: number;
  lockdownsCount?: number;
}
