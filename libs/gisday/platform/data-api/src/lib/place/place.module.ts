import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Place, PlaceLink } from '../entities/all.entity';
import { PlaceController } from './place.controller';
import { PlaceService } from './place.service';

@Module({
  imports: [TypeOrmModule.forFeature([Place, PlaceLink])],
  controllers: [PlaceController],
  providers: [PlaceService]
})
export class PlaceModule {}
