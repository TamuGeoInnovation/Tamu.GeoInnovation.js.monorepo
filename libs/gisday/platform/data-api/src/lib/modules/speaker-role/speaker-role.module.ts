import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpeakerRoleRepo } from '../../entities/all.entity';
import { SpeakerRoleController } from '../../controllers/speaker-role/speaker-role.controller';
import { SpeakerRoleProvider } from '../../providers/speaker-role/speaker-role.provider';

@Module({
  imports: [TypeOrmModule.forFeature([SpeakerRoleRepo])],
  controllers: [SpeakerRoleController],
  providers: [SpeakerRoleProvider],
  exports: [SpeakerRoleProvider]
})
export class SpeakerRoleModule {}
