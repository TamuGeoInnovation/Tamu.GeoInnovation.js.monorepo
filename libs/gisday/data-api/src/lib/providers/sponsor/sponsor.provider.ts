import { Injectable } from '@nestjs/common';

import { Sponsor, SponsorRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
@Injectable()
export class SponsorProvider extends BaseProvider<Sponsor> {
  constructor(private readonly sponsorRepo: SponsorRepo) {
    super(sponsorRepo);
  }
}
