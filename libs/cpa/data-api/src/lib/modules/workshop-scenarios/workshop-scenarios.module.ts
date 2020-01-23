import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkshopScenario } from '@tamu-gisc/cpa/common/entities';

import { WorkshopScenariosController } from './workshop-scenarios.controller';
import { WorkshopScenariosService } from './workshop-scenarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkshopScenario])],
  controllers: [WorkshopScenariosController],
  providers: [WorkshopScenariosService]
})
export class WorkshopScenariosModule {}
