import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CountyClaim, User, County, CountyClaimInfo, EntityToValue, EntityStatus } from '@tamu-gisc/covid/common/entities';

import { CountyClaimsService } from './county-claims.service';
import { CountyClaimsController } from './county-claims.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CountyClaim, User, County, CountyClaimInfo, EntityToValue, EntityStatus])],
  providers: [CountyClaimsService],
  exports: [CountyClaimsService],
  controllers: [CountyClaimsController]
})
export class CountyClaimsModule {}
