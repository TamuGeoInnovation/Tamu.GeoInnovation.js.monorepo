import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TestingSite, ValidatedTestingSite } from '@tamu-gisc/covid/common/entities';

import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestingSite, ValidatedTestingSite])],
  providers: [SitesService],
  controllers: [SitesController]
})
export class SitesModule {}
