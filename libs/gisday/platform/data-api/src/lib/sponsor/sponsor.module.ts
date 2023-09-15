import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Sponsor } from '../entities/all.entity';
import { SponsorController } from './sponsor.controller';
import { SponsorProvider } from './sponsor.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsor])],
  controllers: [SponsorController],
  providers: [SponsorProvider],
  exports: []
})
export class SponsorModule {}
