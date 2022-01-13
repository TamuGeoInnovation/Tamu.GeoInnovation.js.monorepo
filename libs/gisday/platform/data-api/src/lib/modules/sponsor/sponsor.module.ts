import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SponsorRepo } from '../../entities/all.entity';
import { SponsorController } from '../../controllers/sponsor/sponsor.controller';
import { SponsorProvider } from '../../providers/sponsor/sponsor.provider';

@Module({
  imports: [TypeOrmModule.forFeature([SponsorRepo])],
  controllers: [SponsorController],
  providers: [SponsorProvider],
  exports: []
})
export class SponsorModule {}
