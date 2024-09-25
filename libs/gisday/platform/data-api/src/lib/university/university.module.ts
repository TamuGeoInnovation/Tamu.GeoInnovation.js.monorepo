import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UniversityController } from './university.controller';
import { Season, SeasonDay, University } from '../entities/all.entity';
import { UniversityProvider } from './university.provider';
import { SeasonService } from '../season/season.service';

@Module({
  imports: [TypeOrmModule.forFeature([University, Season, SeasonDay])],
  exports: [],
  controllers: [UniversityController],
  providers: [UniversityProvider, SeasonService]
})
export class UniversityModule {}
