import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Response, Scenario, Snapshot } from '@tamu-gisc/cpa/common/entities';

import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Scenario, Response, Snapshot])],
  controllers: [ScenariosController],
  providers: [ScenariosService]
})
export class ScenariosModule {}
