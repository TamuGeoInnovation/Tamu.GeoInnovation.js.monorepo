import { Controller } from '@nestjs/common';

import { Sponsor } from '../../entities/all.entity';
import { SponsorProvider } from '../../providers/sponsor/sponsor.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('sponsor')
export class SponsorController extends BaseController<Sponsor> {
  constructor(private readonly sponsorProvider: SponsorProvider) {
    super(sponsorProvider);
  }
}
