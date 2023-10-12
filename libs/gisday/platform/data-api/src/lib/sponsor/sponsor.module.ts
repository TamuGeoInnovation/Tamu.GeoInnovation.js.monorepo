import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Asset, Sponsor } from '../entities/all.entity';
import { SponsorController } from './sponsor.controller';
import { SponsorProvider } from './sponsor.provider';
import { AssetsService } from '../assets/assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsor, Asset])],
  controllers: [SponsorController],
  providers: [SponsorProvider, AssetsService],
  exports: []
})
export class SponsorModule {}
