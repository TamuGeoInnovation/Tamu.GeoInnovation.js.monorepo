import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Tag } from '../entities/all.entity';
import { TagController } from './tag.controller';
import { TagProvider } from './tag.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [TagController],
  providers: [TagProvider],
  exports: []
})
export class TagModule {}
