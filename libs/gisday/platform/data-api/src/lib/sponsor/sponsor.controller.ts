import { Controller } from '@nestjs/common';

import { Sponsor } from '../entities/all.entity';
import { SponsorProvider } from './sponsor.provider';
import { BaseController } from '../_base/base.controller';

@Controller('sponsors')
export class SponsorController extends BaseController<Sponsor> {
  constructor(private readonly sponsorProvider: SponsorProvider) {
    super(sponsorProvider);
  }
}
