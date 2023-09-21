import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeasonService } from './season.service';
import { SeasonController } from './season.controller';
import { Season, SeasonDay } from '../entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Season, SeasonDay])],
  controllers: [SeasonController],
  providers: [SeasonService]
})
export class SeasonModule {}
