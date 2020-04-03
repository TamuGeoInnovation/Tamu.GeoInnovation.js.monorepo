import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryBuilder } from 'typeorm';

import { CountyClaim, User, County } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class CountyClaimsService extends BaseService<CountyClaim> {
  constructor(
    @InjectRepository(CountyClaim) public repo: Repository<CountyClaim>,
    @InjectRepository(County) public countyRepo: Repository<County>,
    @InjectRepository(User) public userRepo: Repository<User>
  ) {
    super(repo);
  }

  public async getActiveClaims() {
    return this.repo.find({
      where: {
        processing: true
      },
      relations: ['user']
    });
  }

  public async getActiveClaimsForEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });

    const active = await this.repo.find({
      where: {
        user: user,
        processing: true
      },
      relations: ['county']
    });

    return active;
  }

  public async getActiveClaimsForCountyFips(countyFips: number) {
    const active = await this.repo
      .createQueryBuilder('claim')
      .innerJoin('claim.county', 'county')
      .innerJoinAndSelect('claim.user', 'user')
      .where('county.countyFips = :countyFips AND claim.processing = :processingValue', {
        countyFips: countyFips,
        processingValue: true
      })
      .getMany();

    return active;
  }

  /**
   * Register a county to a user.
   */
  public async associateUserWithCounty(countyFips: number, email: string) {
    const user = await this.userRepo.findOne({
      where: {
        email
      }
    });

    if (!user) {
      throw new Error('Invalid email.');
    }

    // Get active claims
    const activeClaims = await this.repo.find({
      where: {
        user: user,
        processing: true
      },
      relations: ['county']
    });

    // Check if the claim by countyFips being requested is already existing.
    const claimedCountyIsSame = activeClaims.find((c) => c.county.countyFips === countyFips);

    // If the user already has the claim, do nothing.
    //
    // Otherwise, create a new claim with the indicated countyFips
    if (activeClaims.length > 0 && claimedCountyIsSame) {
      return claimedCountyIsSame;
    }

    if (!claimedCountyIsSame) {
      await Promise.all([
        activeClaims.map((c) => {
          c.processing = false;
          c.closed = true;

          return c.save();
        })
      ]);
    }

    const county = await this.countyRepo.findOne({ where: { countyFips } });

    if (!county) {
      throw new Error('Invalid county fips.');
    }

    const claim = this.repo.create({ county: county, user: user, processing: true });

    return claim.save();
  }

  public async getClaimsForUser(email: string) {
    const user = await this.userRepo.findOne({
      where: {
        email
      },
      relations: ['claims', 'claims.county']
    });

    return user.claims;
  }
}
