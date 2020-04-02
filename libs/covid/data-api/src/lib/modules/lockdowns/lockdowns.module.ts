import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Lockdown, User, Source, SourceType } from '@tamu-gisc/covid/common/entities';

import { LockdownsService } from './lockdowns.service';
import { LockdownsController } from './lockdowns.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lockdown, User, Source, SourceType])],
  controllers: [LockdownsController],
  providers: [LockdownsService]
})
export class LockdownsModule {}
