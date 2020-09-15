import { Module } from '@nestjs/common';
import { SponsorController } from '../../controllers/sponsor/sponsor.controller';
import { SponsorProvider } from '../../providers/sponsor/sponsor.provider';

@Module({
  imports: [],
  controllers: [SponsorController],
  providers: [SponsorProvider],
  exports: []
})
export class SponsorModule {}
