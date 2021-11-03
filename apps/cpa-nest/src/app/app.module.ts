import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  WorkshopsModule,
  SnapshotsModule,
  ResponsesModule,
  ScenariosModule,
  ParticipantsModule
} from '@tamu-gisc/cpa/data-api';
import {
  Workshop,
  Snapshot,
  Response,
  Scenario,
  WorkshopSnapshot,
  WorkshopScenario,
  WorkshopContext,
  Participant
} from '@tamu-gisc/cpa/common/entities';

import { config } from '../environments/environment';

const entities = [Workshop, Snapshot, WorkshopSnapshot, Response, WorkshopScenario, Scenario, WorkshopContext, Participant];

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...config, entities }),
    WorkshopsModule,
    SnapshotsModule,
    ResponsesModule,
    ScenariosModule,
    ParticipantsModule
  ]
})
export class AppModule {}
