import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Asset, Place, PlaceLink, Season, SeasonDay } from '../entities/all.entity';
import { PlaceController } from './place.controller';
import { PlaceService } from './place.service';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';

@Module({
  imports: [TypeOrmModule.forFeature([Place, PlaceLink, Asset, Season, SeasonDay])],
  controllers: [PlaceController],
  providers: [PlaceService, AssetsService, SeasonService]
})
export class PlaceModule {}
