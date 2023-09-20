import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Season } from './entities/season.entity';
import { SeasonDay } from '../season-day/entities/season-day.entity';
import { SeasonService } from './season.service';
import { SeasonController } from './season.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Season, SeasonDay])],
  controllers: [SeasonController],
  providers: [SeasonService]
})
export class SeasonModule {}
