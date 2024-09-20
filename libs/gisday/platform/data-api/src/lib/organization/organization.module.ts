import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Asset, Event, Organization, PlaceLink, Season, SeasonDay } from '../entities/all.entity';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Asset, PlaceLink, Event, Season, SeasonDay])],
  controllers: [OrganizationController],
  providers: [OrganizationService, AssetsService, SeasonService]
})
export class OrganizationModule {}
