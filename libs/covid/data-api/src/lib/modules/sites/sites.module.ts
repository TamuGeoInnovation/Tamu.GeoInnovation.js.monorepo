import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TestingSite, User, Source, Classification, Restriction, SiteOwner, SiteService, SiteStatus } from '@tamu-gisc/covid/common/entities';

import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestingSite, User, Source, Classification, Restriction, SiteOwner, SiteService, SiteStatus])],
  providers: [SitesService],
  controllers: [SitesController]
})
export class SitesModule {}
