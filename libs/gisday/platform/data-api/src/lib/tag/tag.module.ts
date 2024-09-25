import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Season, SeasonDay, Tag } from '../entities/all.entity';
import { TagController } from './tag.controller';
import { TagProvider } from './tag.provider';
import { SeasonService } from '../season/season.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, Season, SeasonDay])],
  controllers: [TagController],
  providers: [TagProvider, SeasonService],
  exports: []
})
export class TagModule {}
