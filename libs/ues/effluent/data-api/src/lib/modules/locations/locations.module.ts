import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Location, Result } from '@tamu-gisc/ues/effluent/common/entities';

import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Location, Result])],
  controllers: [LocationsController],
  providers: [LocationsService]
})
export class LocationsModule {}
