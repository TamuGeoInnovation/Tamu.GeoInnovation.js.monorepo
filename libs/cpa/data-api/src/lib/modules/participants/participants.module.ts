import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Participant, Workshop } from '@tamu-gisc/cpa/common/entities';

import { WorkshopsService } from '../workshops/workshops.service';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Participant, Workshop])],
  controllers: [ParticipantsController],
  providers: [ParticipantsService, WorkshopsService]
})
export class ParticipantsModule {}
