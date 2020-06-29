import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Scenario } from '@tamu-gisc/cpa/common/entities';

import { ScenariosService } from './scenarios.service';
import { ScenariosController } from './scenarios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Scenario])],
  providers: [ScenariosService],
  controllers: [ScenariosController]
})
export class ScenariosModule {}
