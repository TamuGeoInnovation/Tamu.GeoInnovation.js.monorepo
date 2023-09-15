import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Sponsor } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
@Injectable()
export class SponsorProvider extends BaseProvider<Sponsor> {
  constructor(@InjectRepository(Sponsor) private sponsorRepo: Repository<Sponsor>) {
    super(sponsorRepo);
  }
}
