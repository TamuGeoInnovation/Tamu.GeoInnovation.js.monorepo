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
import { AuthModule } from '@tamu-gisc/oidc/common';

import * as env from '../environments/environment';

const entities = [Workshop, Snapshot, WorkshopSnapshot, Response, WorkshopScenario, Scenario, WorkshopContext, Participant];

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...env.config, entities }),
    AuthModule.forRoot({ jwksUrl: env.jwksUrl }),
    WorkshopsModule,
    SnapshotsModule,
    ResponsesModule,
    ScenariosModule,
    ParticipantsModule
  ]
})
export class AppModule {}
