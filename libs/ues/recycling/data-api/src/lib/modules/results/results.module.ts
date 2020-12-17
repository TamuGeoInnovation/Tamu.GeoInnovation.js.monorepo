import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Result, Location } from '@tamu-gisc/ues/recycling/common/entities';

import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';

@Module({
  imports: [TypeOrmModule.forFeature([Result, Location])],
  controllers: [ResultsController],
  providers: [ResultsService]
})
export class ResultsModule {}
