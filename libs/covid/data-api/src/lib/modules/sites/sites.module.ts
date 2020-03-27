import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TestingSite } from '@tamu-gisc/covid/common/entities';

import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestingSite])],
  providers: [SitesService],
  controllers: [SitesController]
})
export class SitesModule {}
