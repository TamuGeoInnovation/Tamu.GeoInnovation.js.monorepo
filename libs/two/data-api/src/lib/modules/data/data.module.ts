import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AncillaryExpanded, SoilsExpanded, ProFluxExpanded, WeatherfluxExpanded } from '@tamu-gisc/two/common';

import { AncillaryService } from './services/ancillary/ancillary.service';
import { SoilsService } from './services/soils/soils.service';
import { ProFluxService } from './services/proflux/proflux.service';
import { WeatherfluxService } from './services/weatherflux/weatherflux.service';

import { DataController } from './data.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AncillaryExpanded, SoilsExpanded, ProFluxExpanded, WeatherfluxExpanded])],
  controllers: [DataController],
  providers: [WeatherfluxService, ProFluxService, AncillaryService, SoilsService]
})
export class DataModule {}
