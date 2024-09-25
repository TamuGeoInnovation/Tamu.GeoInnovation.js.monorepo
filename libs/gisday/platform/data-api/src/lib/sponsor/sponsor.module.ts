import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Asset, Season, SeasonDay, Sponsor } from '../entities/all.entity';
import { SponsorController } from './sponsor.controller';
import { SponsorProvider } from './sponsor.provider';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsor, Asset, SeasonDay, Season])],
  controllers: [SponsorController],
  providers: [SponsorProvider, AssetsService, SeasonService],
  exports: []
})
export class SponsorModule {}
