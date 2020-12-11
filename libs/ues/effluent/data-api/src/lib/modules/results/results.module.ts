import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Result, Location } from '@tamu-gisc/ues/effluent/common/entities';

import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Result, Location])],
  providers: [ResultsService],
  controllers: [ResultsController]
})
export class ResultsModule {}
