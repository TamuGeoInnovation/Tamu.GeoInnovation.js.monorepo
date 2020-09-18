import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TagRepo } from '../../entities/all.entity';
import { TagController } from '../../controllers/tag/tag.controller';
import { TagProvider } from '../../providers/tag/tag.provider';

@Module({
  imports: [TypeOrmModule.forFeature([TagRepo])],
  controllers: [TagController],
  providers: [TagProvider],
  exports: []
})
export class TagModule {}
