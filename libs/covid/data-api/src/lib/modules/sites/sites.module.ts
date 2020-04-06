import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TestingSite, User, Website, WebsiteType, RestrictionType, SiteOwnerType, SiteServiceType, SiteStatusType } from '@tamu-gisc/covid/common/entities';

import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { CountyClaimsModule } from '../county-claims/county-claims.module';

@Module({
  imports: [TypeOrmModule.forFeature([TestingSite, User, Website, WebsiteType, RestrictionType, SiteOwnerType, SiteServiceType, SiteStatusType]), CountyClaimsModule],
  providers: [SitesService],
  controllers: [SitesController]
})
export class SitesModule {}
