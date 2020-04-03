import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CountyClaim, User, County } from '@tamu-gisc/covid/common/entities';

import { CountyClaimsService } from './county-claims.service';

@Module({
  imports: [TypeOrmModule.forFeature([CountyClaim, User, County])],
  providers: [CountyClaimsService],
  exports: [CountyClaimsService]
})
export class CountyClaimsModule {}
