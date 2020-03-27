import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Lockdown, ValidatedLockdown } from '@tamu-gisc/covid/common/entities';

import { LockdownsService } from './lockdowns.service';
import { LockdownsController } from './lockdowns.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lockdown, ValidatedLockdown])],
  controllers: [LockdownsController],
  providers: [LockdownsService]
})
export class LockdownsModule {}
