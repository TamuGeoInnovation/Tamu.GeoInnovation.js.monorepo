import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpeakerRole } from '../entities/all.entity';
import { SpeakerRoleController } from './speaker-role.controller';
import { SpeakerRoleProvider } from './speaker-role.provider';

@Module({
  imports: [TypeOrmModule.forFeature([SpeakerRole])],
  controllers: [SpeakerRoleController],
  providers: [SpeakerRoleProvider],
  exports: [SpeakerRoleProvider]
})
export class SpeakerRoleModule {}
