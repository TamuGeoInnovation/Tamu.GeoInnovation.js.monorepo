import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TestingSite, TestingSiteInfo, Location, User, CategoryValue, EntityStatus, County, CountyClaim } from '@tamu-gisc/covid/common/entities';

import { TestingSitesService } from './testing-sites.service';
import { TestingSitesController } from './testing-sites.controller';
import { CountyClaimsModule } from '../county-claims/county-claims.module';

@Module({
  imports: [TypeOrmModule.forFeature([County, CountyClaim, EntityStatus, TestingSite, TestingSiteInfo, Location, User, CategoryValue]), CountyClaimsModule],
  providers: [TestingSitesService],
  controllers: [TestingSitesController]
})
export class TestingSitesModule {}
