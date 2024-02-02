import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Asset, Place, PlaceLink } from '../entities/all.entity';
import { PlaceController } from './place.controller';
import { PlaceService } from './place.service';
import { AssetsService } from '../assets/assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Place, PlaceLink, Asset])],
  controllers: [PlaceController],
  providers: [PlaceService, AssetsService]
})
export class PlaceModule {}
