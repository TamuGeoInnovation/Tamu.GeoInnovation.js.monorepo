import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkshopsModule, SnapshotsModule, ResponsesModule, LayersModule, ScenariosModule } from '@tamu-gisc/cpa/data-api';
import {
  Workshop,
  Snapshot,
  Response,
  Scenario,
  WorkshopSnapshot,
  WorkshopScenario,
  WorkshopContext
} from '@tamu-gisc/cpa/common/entities';

import { config } from '../environments/environment';

const entities = [Workshop, Snapshot, WorkshopSnapshot, Response, WorkshopScenario, Scenario, WorkshopContext];

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...config, entities }),
    WorkshopsModule,
    SnapshotsModule,
    ResponsesModule,
    LayersModule,
    ScenariosModule
  ]
})
export class AppModule {}
