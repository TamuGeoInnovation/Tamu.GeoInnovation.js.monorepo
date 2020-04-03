import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Lockdown, User, Website, WebsiteType } from '@tamu-gisc/covid/common/entities';

import { LockdownsService } from './lockdowns.service';
import { LockdownsController } from './lockdowns.controller';
import { CountyClaimsModule } from '../county-claims/county-claims.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lockdown, User, Website, WebsiteType]), CountyClaimsModule],
  controllers: [LockdownsController],
  providers: [LockdownsService]
})
export class LockdownsModule {}
