import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckIn, Class, Season, SeasonDay } from '../entities/all.entity';
import { ClassController } from './class.controller';
import { ClassProvider } from './class.provider';
import { SeasonService } from '../season/season.service';

@Module({
  imports: [TypeOrmModule.forFeature([Class, CheckIn, Season, SeasonDay])],
  controllers: [ClassController],
  providers: [ClassProvider, SeasonService],
  exports: [ClassProvider]
})
export class ClassModule {}
