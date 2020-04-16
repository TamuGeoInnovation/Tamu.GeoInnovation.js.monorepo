import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TestingSite, TestingSiteInfo, Location, User, CategoryValue, EntityStatus, County, CountyClaim } from '@tamu-gisc/covid/common/entities';

import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { CountyClaimsModule } from '../county-claims/county-claims.module';

@Module({
  imports: [TypeOrmModule.forFeature([County, CountyClaim, EntityStatus, TestingSite, TestingSiteInfo, Location, User, CategoryValue]), CountyClaimsModule],
  providers: [SitesService],
  controllers: [SitesController]
})
export class SitesModule {}
