import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { County, CountyClaim } from '@tamu-gisc/covid/common/entities';

import { CountiesService } from './counties.service';
import { CountiesController } from './counties.controller';
import { CountyClaimsModule } from '../county-claims/county-claims.module';

@Module({
  imports: [TypeOrmModule.forFeature([County, CountyClaim]), CountyClaimsModule],
  controllers: [CountiesController],
  providers: [CountiesService]
})
export class CountiesModule {}
