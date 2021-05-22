import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Lockdown, LockdownInfo, User, EntityStatus } from '@tamu-gisc/covid/common/entities';

import { LockdownsService } from './lockdowns.service';
import { LockdownsController } from './lockdowns.controller';
import { CountyClaimsModule } from '../county-claims/county-claims.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lockdown, LockdownInfo, User, EntityStatus]), CountyClaimsModule],
  controllers: [LockdownsController],
  providers: [LockdownsService]
})
export class LockdownsModule {}
