import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkshopScenarios } from '@tamu-gisc/cpa/common/entities';

import { WorkshopScenariosController } from './workshop-scenarios.controller';
import { WorkshopScenariosService } from './workshop-scenarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkshopScenarios])],
  controllers: [WorkshopScenariosController],
  providers: [WorkshopScenariosService]
})
export class WorkshopScenariosModule {}
