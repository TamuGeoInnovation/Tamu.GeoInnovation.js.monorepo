import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TestingSite, User, CategoryValue } from '@tamu-gisc/covid/common/entities';

import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { CountyClaimsModule } from '../county-claims/county-claims.module';

@Module({
  imports: [TypeOrmModule.forFeature([TestingSite, User, CategoryValue]), CountyClaimsModule],
  providers: [SitesService],
  controllers: [SitesController]
})
export class SitesModule {}
